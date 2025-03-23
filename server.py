from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from fastapi import HTTPException
from pydantic import BaseModel


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
    print(f"🔎 Searching for: {product_name} on Amazon...")
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
            asin = product["data-asin"]
            print(f"✅ ASIN Found: {asin}")
            return asin
    print("❌ No ASIN found.")
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

    print("❌ Amazon API request failed!")
    return {"price": "N/A", "product_url": "N/A"}

# API Endpoint to fetch product details
@app.get("/product")
def fetch_product(product_name: str = Query(..., title="Product Name")):
    asin = get_amazon_asin(product_name)
    if asin:
        return get_amazon_price(asin)
    return {"error": "Product not found"}
