from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
import logging
from typing import Optional, Dict, Any

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dummy user database
users_db = {
    "admin@gmail.com": {"password": "admin123", "name": "John Doe"}
}

def get_amazon_asin(product_name: str) -> Optional[str]:
    """Fetch ASIN from Amazon search results"""
    try:
        query = product_name.replace(" ", "+")
        search_url = f"https://www.amazon.in/s?k={query}"
        
        headers = {
            "User-Agent": UserAgent().random,
            "Accept-Language": "en-US,en;q=0.9",
        }

        logger.info(f"Fetching Amazon search results for: {product_name}")
        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        product = soup.select_one('div[data-asin]:not([data-asin=""])')

        if product:
            asin = product["data-asin"]
            logger.info(f"Found ASIN: {asin}")
            return asin
            
        logger.warning("No ASIN found in search results")
        return None

    except Exception as e:
        logger.error(f"Amazon ASIN search failed: {str(e)}")
        return None

def get_amazon_price(asin: str) -> Dict[str, Any]:
    """Fetch price from Amazon using RapidAPI"""
    try:
        url = "https://amazon-real-time-prices-api.p.rapidapi.com/price"
        querystring = {"market": "IN", "asin": asin}
        
        headers = {
            "X-RapidAPI-Key": "08901477f5mshae932b4606f12c4p127a39jsn7924e8164aba",
            "X-RapidAPI-Host": "amazon-real-time-prices-api.p.rapidapi.com"
        }

        logger.info(f"Fetching Amazon price for ASIN: {asin}")
        response = requests.get(url, headers=headers, params=querystring, timeout=10)
        response.raise_for_status()

        data = response.json()
        return {
            "price": data.get("price", "N/A"),
            "product_url": data.get("productUrl", "N/A"),
            "status": "success"
        }

    except Exception as e:
        logger.error(f"Amazon API request failed: {str(e)}")
        return {"price": "N/A", "product_url": "N/A", "status": "error"}

def scrape_flipkart(product_name: str) -> Dict[str, Any]:
    """Scrape Flipkart product data"""
    try:
        api_key = "1ca150d39af21ba962354d607c6dcdb3"
        flipkart_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '%20')}"
        payload = {"api_key": api_key, "url": flipkart_url}

        logger.info(f"Scraping Flipkart for: {product_name}")
        response = requests.get("https://api.scraperapi.com/", params=payload, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        product_container = soup.find("div", {"data-id": True})

        if not product_container:
            logger.warning("No product container found on Flipkart")
            return {"price": "N/A", "product_url": "N/A", "status": "error"}

        link_element = product_container.find("a", href=True)
        product_url = "https://www.flipkart.com" + link_element["href"] if link_element else "N/A"

        price_element = product_container.find(string=re.compile(r"₹\d"))
        price = price_element.strip() if price_element else "N/A"

        return {"price": price, "product_url": product_url, "status": "success"}

    except Exception as e:
        logger.error(f"Flipkart scraping failed: {str(e)}")
        return {"price": "N/A", "product_url": "N/A", "status": "error"}

@app.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required", "status": "error"}), 400

        user = users_db.get(data['email'])
        if not user or user["password"] != data["password"]:
            logger.warning(f"Failed login attempt for email: {data['email']}")
            return jsonify({"error": "Invalid email or password", "status": "error"}), 401

        logger.info(f"Successful login for user: {data['email']}")
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
    """Fetch product details from Amazon and Flipkart"""
    try:
        product_name = request.args.get('product_name')
        if not product_name:
            return jsonify({"error": "Product name is required", "status": "error"}), 400

        logger.info(f"Processing product search for: {product_name}")
        
        amazon_data = {"price": "N/A", "product_url": "N/A", "status": "error"}
        flipkart_data = {"price": "N/A", "product_url": "N/A", "status": "error"}

        # Get Amazon data
        asin = get_amazon_asin(product_name)
        if asin:
            amazon_data = get_amazon_price(asin)

        # Get Flipkart data
        flipkart_data = scrape_flipkart(product_name)

        return jsonify({
            "amazon": amazon_data,
            "flipkart": flipkart_data,
            "status": "success" if amazon_data["status"] == "success" or flipkart_data["status"] == "success" else "error"
        })

    except Exception as e:
        logger.error(f"Product search failed: {str(e)}")
        return jsonify({
            "error": "Failed to fetch product details",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)