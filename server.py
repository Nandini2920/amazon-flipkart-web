from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re
import logging
from typing import Dict, Any, List
from fuzzywuzzy import fuzz

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

users_db = {
    "admin@gmail.com": {"password": "admin123", "name": "John Doe"}
}

def is_similar_product(title1: str, title2: str, threshold: int = 80) -> bool:
    similarity = fuzz.token_set_ratio(title1.lower(), title2.lower())
    logger.info(f"Title similarity: {similarity}%")
    return similarity >= threshold

def scrape_amazon(product_name: str) -> Dict[str, Any]:
    results = scrape_amazon_multiple(product_name)
    return results[0] if results else {"title": "", "price": "N/A", "product_url": "N/A", "status": "error"}

def scrape_amazon_multiple(product_name: str) -> List[Dict[str, Any]]:
    try:
        api_key = "28014a4e4f706ce254b4cb1bbb499ab2"
        amazon_url = f"https://www.amazon.in/s?k={product_name.replace(' ', '+')}"
        payload = {"api_key": api_key, "url": amazon_url, "keep_headers": "true"}
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/91.0.4472.124 Safari/537.36"
            )
        }

        logger.info(f"Scraping Amazon for: {product_name}")
        response = requests.get("https://api.scraperapi.com/", params=payload, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        products = soup.find_all("div", {"data-component-type": "s-search-result"})

        result_list = []
        for product in products:
            try:
                title_element = product.find("h2")
                name = title_element.text.strip() if title_element else "Name not available"

                link_tag = product.select_one("a.a-link-normal.s-no-outline")
                href = link_tag.get("href") if link_tag else None
                product_url = f"https://www.amazon.in{href}" if href else "Link not available"

                price_whole = product.select_one("span.a-price span.a-price-whole")
                price_symbol = product.select_one("span.a-price span.a-price-symbol")
                price_fraction = product.select_one("span.a-price span.a-price-fraction")

                if price_symbol and price_whole:
                    price = f"{price_symbol.text}{price_whole.text}{price_fraction.text if price_fraction else ''}"
                else:
                    price = "Price not available"

                result_list.append({
                    "title": name,
                    "price": price,
                    "product_url": product_url,
                    "status": "success"
                })
            except Exception as e:
                logger.warning(f"Error parsing Amazon product: {e}")
                continue

        return result_list

    except Exception as e:
        logger.error(f"Amazon scraping failed: {str(e)}")
        return []

def scrape_flipkart(product_name: str) -> Dict[str, Any]:
    results = scrape_flipkart_multiple(product_name)
    return results[0] if results else {"title": "", "price": "N/A", "product_url": "N/A", "status": "error"}

def scrape_flipkart_multiple(product_name: str) -> List[Dict[str, Any]]:
    try:
        api_key = "28014a4e4f706ce254b4cb1bbb499ab2"
        flipkart_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '%20')}"
        payload = {"api_key": api_key, "url": flipkart_url}

        logger.info(f"Scraping Flipkart for: {product_name}")
        response = requests.get("https://api.scraperapi.com/", params=payload, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        product_containers = soup.find_all("div", {"data-id": True})

        result_list = []
        for product_container in product_containers:
            try:
                link_element = product_container.find("a", href=True)
                product_url = "https://www.flipkart.com" + link_element["href"] if link_element else "N/A"

                title_element = product_container.find("div", {"class": re.compile(r"_4rR01T|s1Q9rs")})
                title = title_element.text.strip() if title_element else "Name not available"

                price_element = product_container.find(string=re.compile(r"₹\d"))
                price = price_element.strip() if price_element else "N/A"

                result_list.append({
                    "title": title,
                    "price": price,
                    "product_url": product_url,
                    "status": "success"
                })
            except Exception as e:
                logger.warning(f"Error parsing Flipkart product: {e}")
                continue

        return result_list

    except Exception as e:
        logger.error(f"Flipkart scraping failed: {str(e)}")
        return []

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required", "status": "error"}), 400

        user = users_db.get(data['email'])
        if not user or user["password"] != data["password"]:
            logger.warning(f"Failed login for {data['email']}")
            return jsonify({"error": "Invalid email or password", "status": "error"}), 401

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
            return jsonify({"error": "Product name is required", "status": "error"}), 400

        # Fetch multiple products from both platforms
        amazon_results = scrape_amazon_multiple(product_name)
        flipkart_results = scrape_flipkart_multiple(product_name)

        # Initialize response data
        amazon_data = {"title": "", "price": "N/A", "product_url": "N/A", "status": "error", "more_options": []}
        flipkart_data = {"title": "", "price": "N/A", "product_url": "N/A", "status": "error", "more_options": []}

        # Process Amazon results
        if amazon_results:
            amazon_data = amazon_results[0]
            amazon_data["more_options"] = amazon_results[1:]

        # Process Flipkart results
        if flipkart_results:
            flipkart_data = flipkart_results[0]
            flipkart_data["more_options"] = flipkart_results[1:]

        # Check if both platforms returned successful results
        if amazon_data["status"] == "success" and flipkart_data["status"] == "success":
            if is_similar_product(amazon_data["title"], flipkart_data["title"]):
                return jsonify({
                    "amazon": amazon_data,
                    "flipkart": flipkart_data,
                    "status": "success"
                })
            else:
                return jsonify({
                    "amazon": amazon_data,
                    "flipkart": flipkart_data,
                    "status": "error",
                    "message": "Products fetched do not match closely enough for comparison"
                })

        return jsonify({
            "amazon": amazon_data,
            "flipkart": flipkart_data,
            "status": "error",
            "message": "Could not fetch data from both sites successfully"
        })

    except Exception as e:
        logger.error(f"Product search failed: {str(e)}")
        return jsonify({"error": "Failed to fetch product details", "status": "error"}), 500

@app.route('/more-options', methods=['GET'])
def fetch_more_options():
    try:
        product_name = request.args.get("product_name")
        site = request.args.get("site")

        if not product_name or not site:
            return jsonify({"error": "Missing product_name or site", "status": "error"}), 400

        if site == "amazon":
            results = scrape_amazon_multiple(product_name)
        elif site == "flipkart":
            results = scrape_flipkart_multiple(product_name)
        else:
            return jsonify({"error": "Invalid site value. Use 'amazon' or 'flipkart'", "status": "error"}), 400

        return jsonify({"products": results, "status": "success"})

    except Exception as e:
        logger.error(f"More options fetch failed: {str(e)}")
        return jsonify({"error": "Failed to fetch more products", "status": "error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)