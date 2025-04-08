from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
import time
import random
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dummy user database
users_db = {
    "admin@gmail.com": {"password": "admin123", "name": "John Doe"}
}

# Configure retry strategy
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)
http.mount("http://", adapter)

# ScraperAPI configuration
SCRAPER_API_KEY = "1ca150d39af21ba962354d607c6dcdb3"  # Replace with your actual ScraperAPI key

def scrape_amazon(product_name):
    try:
        # Random delay to prevent rate limiting
        time.sleep(random.uniform(1, 2))
        
        amazon_url = f"https://www.amazon.in/s?k={product_name.replace(' ', '+')}"
        
        payload = {
            "api_key": SCRAPER_API_KEY,
            "url": amazon_url,
            "keep_headers": "true"
        }

        headers = {
            "User-Agent": UserAgent().random,
            "Accept-Language": "en-US,en;q=0.9",
        }

        logger.info(f"Scraping Amazon for: {product_name}")
        response = http.get("https://api.scraperapi.com/", params=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logger.warning(f"Amazon response status: {response.status_code}")
            return {"products": [], "status": "error"}

        soup = BeautifulSoup(response.text, 'html.parser')
        products = soup.find_all("div", {"data-component-type": "s-search-result"})

        if not products:
            logger.warning("No products found on Amazon.")
            return {"products": [], "status": "error"}

        product_list = []
        for product in products[:5]:  # Limit to 5 products
            title_element = product.find("h2")
            name = title_element.text.strip() if title_element else "Name not available"

            link_tag = title_element.find("a", href=True) if title_element else None
            href = link_tag.get("href") if link_tag else None
            product_link = f"https://www.amazon.in{href}" if href else "Link not available"

            price_whole = product.select_one("span.a-price span.a-price-whole")
            price_symbol = product.select_one("span.a-price span.a-price-symbol")
            price_fraction = product.select_one("span.a-price span.a-price-fraction")

            if price_symbol and price_whole:
                price = f"{price_symbol.text}{price_whole.text}{price_fraction.text if price_fraction else ''}"
            else:
                price = "Price not available"

            product_list.append({
                "name": name,
                "price": price,
                "product_url": product_link
            })

        return {
            "products": product_list,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"Amazon scraping failed: {str(e)}")
        return {"products": [], "status": "error"}

def scrape_flipkart(product_name):
    try:
        # Random delay to prevent rate limiting
        time.sleep(random.uniform(1, 2))
        
        flipkart_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '%20')}"
        
        payload = {
            "api_key": SCRAPER_API_KEY,
            "url": flipkart_url,
            "keep_headers": "true"
        }

        headers = {
            "User-Agent": UserAgent().random,
            "Accept-Language": "en-US,en;q=0.9",
        }

        logger.info(f"Scraping Flipkart for: {product_name}")
        response = http.get("https://api.scraperapi.com/", params=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logger.warning(f"Flipkart response status: {response.status_code}")
            return {"products": [], "status": "error"}

        soup = BeautifulSoup(response.text, "html.parser")
        products = soup.select("div._1AtVbE")  # Main product container

        if not products:
            logger.warning("No products found on Flipkart.")
            return {"products": [], "status": "error"}

        product_list = []
        for product in products[:5]:  # Limit to 5 products
            name_tag = product.select_one("a.IRpwTa") or product.select_one("a.s1Q9rs")
            name = name_tag.text.strip() if name_tag else "Name not available"

            href = name_tag.get("href") if name_tag else None
            product_link = f"https://www.flipkart.com{href}" if href else "Link not available"

            price_tag = product.select_one("div._30jeq3")
            price = price_tag.text.strip() if price_tag else "Price not available"

            product_list.append({
                "name": name,
                "price": price,
                "product_url": product_link
            })

        return {
            "products": product_list,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"Flipkart scraping failed: {str(e)}")
        return {"products": [], "status": "error"}

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password required", "status": "error"}), 400

        user = users_db.get(data['email'])
        if not user or user["password"] != data["password"]:
            logger.warning(f"Failed login attempt for: {data['email']}")
            return jsonify({"error": "Invalid credentials", "status": "error"}), 401

        return jsonify({
            "message": "Login successful",
            "user": data['email'],
            "name": user["name"],
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error", "status": "error"}), 500

@app.route('/product', methods=['GET'])
def fetch_product():
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({"error": "Product name required", "status": "error"}), 400

        logger.info(f"Processing product search for: {product_name}")
        
        amazon_data = scrape_amazon(product_name)
        flipkart_data = scrape_flipkart(product_name)

        return jsonify({
    "amazon": {
        "main": amazon_data["products"][0] if amazon_data["products"] else {},
        "more": amazon_data["products"][1:] if len(amazon_data["products"]) > 1 else []
    },
    "flipkart": {
        "main": flipkart_data["products"][0] if flipkart_data["products"] else {},
        "more": flipkart_data["products"][1:] if len(flipkart_data["products"]) > 1 else []
    },
    "status": "success" if amazon_data["status"] == "success" or flipkart_data["status"] == "success" else "partial_success"
})


    except Exception as e:
        logger.error(f"Product search failed: {str(e)}")
        return jsonify({
            "error": "Failed to fetch product details",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)