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

def get_amazon_asin(product_name):
    try:
        # Random delay to prevent rate limiting
        time.sleep(random.uniform(1, 2))
        
        query = product_name.replace(" ", "+")
        search_url = f"https://www.amazon.in/s?k={query}"

        headers = {
            "User-Agent": UserAgent().random,
            "Accept-Language": "en-US,en;q=0.9",
        }

        logger.info(f"Fetching Amazon ASIN for: {product_name}")
        response = http.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 503:
            logger.warning("Amazon CAPTCHA triggered")
            return None
            
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # More robust product detection
        product = soup.select_one('div[data-asin]:not([data-asin=""])') or \
                  soup.find('div', {'data-component-type': 's-search-result'})
        
        if product and hasattr(product, 'data-asin'):
            asin = product["data-asin"]
            logger.info(f"Found ASIN: {asin}")
            return asin
            
        logger.warning("No ASIN found in search results")
        return None

    except Exception as e:
        logger.error(f"Amazon ASIN search failed: {str(e)}")
        return None

def get_amazon_price(asin):
    try:
        url = "https://amazon-real-time-prices-api.p.rapidapi.com/price"
        querystring = {"market": "IN", "asin": asin}

        headers = {
            "X-RapidAPI-Key": "08901477f5mshae932b4606f12c4p127a39jsn7924e8164aba",
            "X-RapidAPI-Host": "amazon-real-time-prices-api.p.rapidapi.com"
        }

        logger.info(f"Fetching Amazon price for ASIN: {asin}")
        response = http.get(url, headers=headers, params=querystring, timeout=10)
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

def scrape_flipkart(product_name):
    try:
        # Random delay to prevent rate limiting
        time.sleep(random.uniform(1, 2))
        
        api_key = "ba8b630610e8750434163b86c414068e"
        flipkart_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '%20')}"
        payload = {
            "api_key": api_key,
            "url": flipkart_url,
        }

        logger.info(f"Scraping Flipkart for: {product_name}")
        response = http.get("https://api.scraperapi.com/", params=payload, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        
        # More robust product detection
        product_container = soup.find("div", {"data-id": True}) or \
                          soup.find("div", class_="_4ddWXP")
        
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
        
        amazon_data = {"price": "N/A", "product_url": "N/A", "status": "error"}
        flipkart_data = {"price": "N/A", "product_url": "N/A", "status": "error"}

        # Get Amazon data with retry
        asin = get_amazon_asin(product_name)
        if asin:
            amazon_data = get_amazon_price(asin)

        # Get Flipkart data with retry
        flipkart_data = scrape_flipkart(product_name)

        return jsonify({
            "amazon": amazon_data,
            "flipkart": flipkart_data,
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