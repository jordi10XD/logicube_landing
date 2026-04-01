from PIL import Image
try:
    img = Image.open('isotipo.webp')
    img.thumbnail((800, 800))
    img.save('isotipo_2.webp', 'WEBP')
    print("isotipo.webp resized.")
except Exception as e:
    print("Error resizing isotipo:", e)

try:
    logo = Image.open('logo_logicube.webp')
    logo.thumbnail((200, 200))
    logo.save('logo_logicube_2.webp', 'WEBP')
    print("logo_logicube.webp resized.")
except Exception as e:
    print("Error resizing logo:", e)
