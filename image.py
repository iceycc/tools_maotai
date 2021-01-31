votepath = "temp/0504293868532213.png"

# from PIL import Image
# im = Image.open(votepath)
# im.show()

# import pytesseract
# print(pytesseract.image_to_string(Image.open(votepath)))
# print(pytesseract.image_to_string(Image.open(votepath), lang='eng'))#后面的lang是语言

from PIL import Image
from PIL import ImageEnhance
import pytesseract
im=Image.open(votepath)
im=im.convert('L')
im.show()
im=ImageEnhance.Contrast(im)
im=im.enhance(3)
im.show()
print(pytesseract.image_to_string(im))
