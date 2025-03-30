from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from pydantic import BaseModel
import re
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy user database
users_db = {
    "test@example.com": {"password": "password123", "name": "John Doe"}
}

# Request body model
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    user = users_db.get(request.email)

    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user": request.email, "name": user["name"]}

# Function to fetch ASIN from Amazon
def get_amazon_asin(product_name):
    query = product_name.replace(" ", "+")
    search_url = f"https://www.amazon.in/s?k={query}"

    headers = {
        "User-Agent": UserAgent().random,
        "Accept-Language": "en-US,en;q=0.9",
    }

    response = requests.get(search_url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        product = soup.select_one('div[data-asin]:not([data-asin=""])')

        if product:
            return product["data-asin"]
    return None

# Function to get price from RapidAPI
def get_amazon_price(asin):
    url = "https://amazon-real-time-prices-api.p.rapidapi.com/price"
    querystring = {"market": "IN", "asin": asin}

    headers = {
        "X-RapidAPI-Key": "d436a9f90amsh519d8ca688b6fbcp161ff4jsn50aa79999b64",
        "X-RapidAPI-Host": "amazon-real-time-prices-api.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code == 200:
        data = response.json()
        return {
            "price": data.get("price", "N/A"),
            "product_url": data.get("productUrl", "N/A")
        }
    return {"price": "N/A", "product_url": "N/A"}


def scrape_flipkart(product_name):
    api_key = "1ca150d39af21ba962354d607c6dcdb3"  # Replace with your actual ScraperAPI key
    flipkart_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '%20')}"

    # ScraperAPI settings
    payload = {
        "api_key": api_key,
        "url": flipkart_url,
    }

    try:
        response = requests.get("https://api.scraperapi.com/", params=payload)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")

            # Find first product
            product_container = soup.find("div", {"data-id": True})
            if not product_container:
                return {"price": "N/A", "product_url": "N/A"}

            # Extract product link
            link_element = product_container.find("a", href=True)
            product_url = "https://www.flipkart.com" + link_element["href"] if link_element else "N/A"

            # Extract price (using regex for ₹)
            price_element = product_container.find(string=re.compile(r"₹\d"))
            price = price_element.strip() if price_element else "N/A"

            return {"price": price, "product_url": product_url}

    except Exception as e:
        print(f"Error fetching Flipkart data: {e}")

    return {"price": "N/A", "product_url": "N/A"}

    

# API Endpoint to fetch product details
@app.get("/product")
def fetch_product(product_name: str = Query(..., title="Product Name")):
    amazon_data = {"price": "N/A", "product_url": "N/A"}
    flipkart_data = {"price": "N/A", "product_url": "N/A"}

    asin = get_amazon_asin(product_name)
    if asin:
        amazon_data = get_amazon_price(asin)

    flipkart_data = scrape_flipkart(product_name)

    return {"amazon": amazon_data, "flipkart": flipkart_data}
