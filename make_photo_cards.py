from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

BASE_URL = "https://kirillz7.github.io/airway/index.html"

# ТЕПЕРЬ 8 КЕЙСОВ
cases = {
    "adult": "Взрослый",
    "child": "Ребенок",
    "infant": "Младенец",
    "pregnant": "Беременная",
    "self": "Сам себе",
    "burn": "Ожог",
    "bleeding": "Кровотечение",
    "fracture": "Перелом"
}

W, H = 1181, 1772
BG_COLOR = "#F5F6F7"
GRAPHITE = "#1B1B1E"
RED = "#D62839"
GRAY = "#6B6B72"

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"

os.makedirs("photo_cards", exist_ok=True)

for case_id, title in cases.items():
    img = Image.new('RGB', (W, H), color=BG_COLOR)
    draw = ImageDraw.Draw(img)

    url = f"{BASE_URL}#briefing/{case_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=GRAPHITE, back_color="white").get_image()
    
    qr_img = qr_img.resize((750, 750), Image.Resampling.LANCZOS)
    
    qr_x = (W - 750) // 2
    qr_y = 480
    img.paste(qr_img, (qr_x, qr_y))

    try:
        font_title = ImageFont.truetype(FONT_BOLD, 110)
        font_subtitle = ImageFont.truetype(FONT_REGULAR, 40)
        font_case = ImageFont.truetype(FONT_BOLD, 65)
        font_steps = ImageFont.truetype(FONT_REGULAR, 38)
        font_footer = ImageFont.truetype(FONT_REGULAR, 25)
    except IOError:
        font_title = ImageFont.load_default()

    draw.text((W//2, 150), "AIRWAY", font=font_title, fill=RED, anchor="mm")
    draw.text((W//2, 250), "Симулятор первой помощи", font=font_subtitle, fill=GRAY, anchor="mm")
    draw.text((W//2, 370), f"КЕЙС: {title.upper()}", font=font_case, fill=GRAPHITE, anchor="mm")

    instructions = "1. Наведи камеру телефона на QR-код.\n2. Пройди симуляцию за 1 минуту.\n3. Проверь, сможешь ли ты спасти жизнь."
    draw.multiline_text((W//2, 1350), instructions, font=font_steps, fill=GRAPHITE, anchor="ma", align="center", spacing=25)

    draw.text((W//2, 1650), "Образовательный проект. Не заменяет курс первой помощи.", font=font_footer, fill=GRAY, anchor="mm")

    img.save(f"photo_cards/{title}.jpg", quality=100)
    print(f"Макет для фотосети создан: {title}")

print("Готово! Все 8 макетов лежат в папке photo_cards.")