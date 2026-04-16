import qrcode
import os
import json

products_data = [
    # Category 1: Medicine
    {"category": "Medicine", "name": "Paracetamol 500mg", "brand": "Sara", "qr_code": "8850123001", "price": 25.00, "min_stock": 50},
    {"category": "Medicine", "name": "Amoxicillin 250mg", "brand": "GPO", "qr_code": "8850123002", "price": 120.00, "min_stock": 20},
    {"category": "Medicine", "name": "Cough Syrup", "brand": "Leopard", "qr_code": "8850123003", "price": 45.00, "min_stock": 15},
    {"category": "Medicine", "name": "Antacid Gel", "brand": "Belcid", "qr_code": "8850123004", "price": 65.00, "min_stock": 10},
    {"category": "Medicine", "name": "Alcohol 70%", "brand": "Siribuncha", "qr_code": "8850123005", "price": 40.00, "min_stock": 30},

    # Category 2: Supplements
    {"category": "Supplements", "name": "Vitamin C 1000mg", "brand": "Blackmores", "qr_code": "8850123006", "price": 550.00, "min_stock": 10},
    {"category": "Supplements", "name": "Fish Oil 1000mg", "brand": "Mega We Care", "qr_code": "8850123007", "price": 420.00, "min_stock": 10},
    {"category": "Supplements", "name": "Zinc Complex", "brand": "Vistra", "qr_code": "8850123008", "price": 320.00, "min_stock": 5},

    # Category 3: Drinks
    {"category": "Drinks", "name": "Mineral Water 600ml", "brand": "Singha", "qr_code": "8850123009", "price": 10.00, "min_stock": 100},
    {"category": "Drinks", "name": "Green Tea Honey", "brand": "Oishi", "qr_code": "8850123010", "price": 20.00, "min_stock": 48},
    {"category": "Drinks", "name": "Black Coffee No Sugar", "brand": "Amazon", "qr_code": "8850123011", "price": 35.00, "min_stock": 24},

    # Category 4: Snacks
    {"category": "Snacks", "name": "Potato Chips Original", "brand": "Lays", "qr_code": "8850123012", "price": 30.00, "min_stock": 20},
    {"category": "Snacks", "name": "Chocolate Bar", "brand": "KitKat", "qr_code": "8850123013", "price": 25.00, "min_stock": 30},
    {"category": "Snacks", "name": "Almond Roasted", "brand": "Tong Garden", "qr_code": "8850123014", "price": 45.00, "min_stock": 15},

    # Category 5: Electronics
    {"category": "Electronics", "name": "USB-C Cable 1m", "brand": "Anker", "qr_code": "8850123015", "price": 290.00, "min_stock": 10},
    {"category": "Electronics", "name": "Power Bank 10000mAh", "brand": "Eloop", "qr_code": "8850123016", "price": 590.00, "min_stock": 5},
    {"category": "Electronics", "name": "Wireless Mouse", "brand": "Logitech", "qr_code": "8850123017", "price": 450.00, "min_stock": 8},

    # Category 6: Stationery
    {"category": "Stationery", "name": "Gel Pen Blue 0.5", "brand": "Pentel", "qr_code": "8850123018", "price": 45.00, "min_stock": 50},
    {"category": "Stationery", "name": "A4 Paper 80gsm", "brand": "Double A", "qr_code": "8850123019", "price": 145.00, "min_stock": 20},
    {"category": "Stationery", "name": "Notebook B5", "brand": "Muji", "qr_code": "8850123020", "price": 85.00, "min_stock": 15}
]

def generate_qrcodes(base_folder):
    for item in products_data:
        category = item["category"]
        product_name = item["name"]
        qr_code_id = item["qr_code"]
        
        category_folder = os.path.join(base_folder, category)
        os.makedirs(category_folder, exist_ok=True)
        
        qr_payload = item["qr_code"]
        
        qr = qrcode.QRCode(
            version=2, 
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10, 
            border=4
        )
        qr.add_data(qr_payload) 
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        clean_name = product_name.replace(" ", "_").replace("%", "pct")
        safe_filename = f"{qr_code_id}_{clean_name}.png"
        file_path = os.path.join(category_folder, safe_filename)
        
        img.save(file_path)

if __name__ == "__main__":
    print("Creating...")
    generate_qrcodes("Qrs")
    print("Complete!")