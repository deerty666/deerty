from zipfile import ZipFile
import os

# إعداد مجلد المشروع
project_folder = '/mnt/data/deerty-website'
images_folder = os.path.join(project_folder, 'images')
os.makedirs(images_folder, exist_ok=True)

# محتوى index.html
index_html = """<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>مطعم ديرتي</title>
<style>
body { font-family: Arial, sans-serif; background-color: #fff8f0; margin:0; padding:0; direction:rtl; color:#333; }
header { background-color:#c0392b; color:white; padding:20px; text-align:center; }
header h1{ margin:0; font-size:2em; }
nav{ display:flex; justify-content:center; background-color:#e74c3c; flex-wrap:wrap; }
nav a{ color:white; text-decoration:none; margin:0 15px; padding:15px 0; display:inline-block; font-weight:bold; }
nav a:hover{ background-color:#c0392b; }
.content{ max-width:1000px; margin:20px auto; padding:0 15px; }
.category{ margin-bottom:40px; }
.category h2{ color:#c0392b; border-bottom:2px solid #c0392b; padding-bottom:5px; margin-bottom:20px; }
.menu-items, .categories{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; }
.item-card{ background:white; border-radius:8px; box-shadow:0 3px 6px rgba(0,0,0,0.1); overflow:hidden; text-align:center; transition:transform 0.2s; }
.item-card:hover{ transform:scale(1.05); }
.item-card img{ width:100%; height:150px; object-fit:cover; }
.item-card h3{ margin:10px 0 5px; font-size:1.2em; color:#c0392b; }
.item-card p{ margin:0 0 10px; font-weight:bold; }
.whatsapp-button{ display:block; width:220px; margin:20px auto; text-align:center; background-color:#25d366; color:white; padding:15px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:1.1em; }
.whatsapp-button:hover{ background-color:#1ebe57; }
footer{text-align:center;padding:15px;background-color:#e74c3c;color:white;margin-top:40px;}
</style>
</head>
<body>
<header>
<h1>مطعم ديرتي</h1>
<p>قريباً شعارنا هنا</p>
</header>

<nav>
<a href="index.html">الرئيسية</a>
<a href="about.html">عن المطعم</a>
<a href="#contact">تواصل معنا</a>
</nav>

<div class="content">
<section id="menu" class="category">
<h2>قائمة الطعام</h2>
<div class="menu-items">
<div class="item-card">
<img src="images/chicken.jpg" alt="دجاج مشوي">
<h3>وجبة الدجاج المشوي</h3>
<p>50 ريال</p>
</div>
<div class="item-card">
<img src="images/kebab.jpg" alt="كباب لحم">
<h3>كباب لحم</h3>
<p>60 ريال</p>
</div>
<div class="item-card">
<img src="images/salad.jpg" alt="سلطة خضراء">
<h3>سلطة خضراء</h3>
<p>15 ريال</p>
</div>
<div class="item-card">
<img src="images/dessert.jpg" alt="حلويات">
<h3>كنافة</h3>
<p>25 ريال</p>
</div>
</div>
</section>

<section id="categories" class="category">
<h2>الفئات</h2>
<div class="categories">
<div class="item-card">
<img src="images/chicken.jpg" alt="مشويات">
<h3>مشويات</h3>
</div>
<div class="item-card">
<img src="images/kebab.jpg" alt="مشروبات">
<h3>مشروبات</h3>
</div>
<div class="item-card">
<img src="images/dessert.jpg" alt="حلويات">
<h3>حلويات</h3>
</div>
</div>
</section>

<section id="contact" class="category">
<h2>تواصل معنا</h2>
<a href="https://wa.me/0536803598" class="whatsapp-button">أرسل لنا على واتساب</a>
</section>
</div>

<footer>
جميع الحقوق محفوظة © مطعم ديرتي
</footer>
</body>
</html>
"""

# محتوى about.html
about_html = """<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>عن مطعم ديرتي</title>
<style>
body { font-family: Arial, sans-serif; background-color: #fff8f0; margin:0; padding:0; direction:rtl; color:#333; }
header { background-color:#c0392b; color:white; padding:20px; text-align:center; }
header h1{ margin:0; font-size:2em; }
nav{ display:flex; justify-content:center; background-color:#e74c3c; flex-wrap:wrap; }
nav a{ color:white; text-decoration:none; margin:0 15px; padding:15px 0; display:inline-block; font-weight:bold; }
nav a:hover{ background-color:#c0392b; }
.content{ max-width:1000px; margin:20px auto; padding:0 15px; }
.category{ margin-bottom:40px; }
.category h2{ color:#c0392b; border-bottom:2px solid #c0392b; padding-bottom:5px; margin-bottom:20px; }
</style>
</head>
<body>
<header>
<h1>عن مطعم ديرتي</h1>
</header>

<nav>
<a href="index.html">الرئيسية</a>
<a href="about.html">عن المطعم</a>
<a href="#contact">تواصل معنا</a>
</nav>

<div class="content">
<section class="category">
<h2>معلومات عن المطعم</h2>
<p>مرحباً بكم في مطعم ديرتي! نقدم ألذ الأطباق العربية والمشويات الطازجة والحلويات المميزة. يمكنكم الطلب مباشرة عبر واتساب.</p>
</section>
</div>

<footer>
جميع الحقوق محفوظة © مطعم ديرتي
</footer>
</body>
</html>
"""

# حفظ الملفات
with open(os.path.join(project_folder, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)

with open(os.path.join(project_folder, "about.html"), "w", encoding="utf-8") as f:
    f.write(about_html)

# إنشاء ZIP
zip_filename = '/mnt/data/deerty-website.zip'
with ZipFile(zip_filename, 'w') as zipf:
    for root, dirs, files in os.walk(project_folder):
        for file in files:
            zipf.write(os.path.join(root, file), arcname=os.path.join(os.path.relpath(root, project_folder), file))

zip_filename
