<?php
declare(strict_types=1);

use Faber\Sql;

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);

$categories = [
    'mtbx-gigiyenas' => ['ru' => 'Гигиена кухни', 'tr' => 'Mutfak hijyeni', 'en' => 'Kitchen hygiene'],
    'camashir-gigiynasi' => ['ru' => 'Гигиена стирки', 'tr' => 'Çamaşır hijyeni', 'en' => 'Laundry hygiene'],
    'sas-yuyucu-vasitlr' => ['ru' => 'Основные средства для стирки', 'tr' => 'Ana yıkama deterjanları', 'en' => 'Main wash detergents'],
    'lav-yuyucu-vasitlr' => ['ru' => 'Вспомогательные средства для стирки', 'tr' => 'Yardımcı yıkama ürünleri', 'en' => 'Laundry additives'],
    'lkaparan-v-aardc-vasitlr' => ['ru' => 'Пятновыводители и отбеливатели', 'tr' => 'Leke çıkarıcılar ve ağartıcılar', 'en' => 'Stain removers and bleaches'],
    'hamam-otann-gigiyenas' => ['ru' => 'Уборка и гигиена ванных комнат', 'tr' => 'Banyo temizliği ve hijyeni', 'en' => 'Bathroom cleaning and hygiene'],
    'xsi-gigiyena' => ['ru' => 'Личная гигиена', 'tr' => 'Kişisel hijyen', 'en' => 'Personal hygiene'],
    'tmizlik' => ['ru' => 'Уборка', 'tr' => 'Temizlik', 'en' => 'Cleaning'],
    'xsusi-vasitlr' => ['ru' => 'Специальные средства', 'tr' => 'Özel ürünler', 'en' => 'Speciality products'],
    'axs-sthlr-qulluq' => ['ru' => 'Уход за стеклом и глянцевыми поверхностями', 'tr' => 'Cam ve parlak yüzey bakımı', 'en' => 'Glass and glossy surface care'],
    'dm-n-qulluq' => ['ru' => 'Уход за полами', 'tr' => 'Zemin bakımı', 'en' => 'Floor care'],
    'xala-tmizlm' => ['ru' => 'Чистка ковров', 'tr' => 'Halı temizliği', 'en' => 'Carpet cleaning'],
    'hovuza-qulluq' => ['ru' => 'Уход за бассейном', 'tr' => 'Havuz bakımı', 'en' => 'Pool care'],
    'qida-s-nayesi-mu-ssis-l-rind-gigiyena-qaydalar' => ['ru' => 'Пищевая гигиена', 'tr' => 'Gıda hijyeni', 'en' => 'Food hygiene'],
    'yuma' => ['ru' => 'Моющие средства', 'tr' => 'Yıkama ürünleri', 'en' => 'Detergents'],
    'yuyucu-v-dezinfeksiya' => ['ru' => 'Моющие и дезинфицирующие средства', 'tr' => 'Yıkama ve dezenfeksiyon', 'en' => 'Cleaning and disinfection'],
    'dezinfeksiya' => ['ru' => 'Дезинфекция', 'tr' => 'Dezenfeksiyon', 'en' => 'Disinfection'],
    'təmizlik-avadanligi' => ['ru' => 'Оборудование для уборки', 'tr' => 'Temizlik ekipmanları', 'en' => 'Cleaning equipment'],
    'tmizlik-arabalar' => ['ru' => 'Уборочные тележки', 'tr' => 'Temizlik arabaları', 'en' => 'Cleaning trolleys'],
    'tək-istifadəlik-məhsullar' => ['ru' => 'Одноразовые изделия', 'tr' => 'Tek kullanımlık ürünler', 'en' => 'Disposable products'],
    'kagiz-məhsullari' => ['ru' => 'Бумажная продукция', 'tr' => 'Kâğıt ürünleri', 'en' => 'Paper products'],
    'mətbəx' => ['ru' => 'Кухня', 'tr' => 'Mutfak', 'en' => 'Kitchen'],
    'vanna-otagi' => ['ru' => 'Ванная комната', 'tr' => 'Banyo', 'en' => 'Bathroom'],
    'dispenserlər' => ['ru' => 'Дозаторы', 'tr' => 'Dispenserler', 'en' => 'Dispensers'],
];

$phrases = [
    'Tətbiq üsulu' => ['ru' => 'Способ применения', 'tr' => 'Uygulama yöntemi', 'en' => 'How to use'],
    'Çirklənmə dərəcəsi' => ['ru' => 'Степень загрязнения', 'tr' => 'Kir düzeyi', 'en' => 'Soil level'],
    'Məhsulun adı' => ['ru' => 'Название продукта', 'tr' => 'Ürün adı', 'en' => 'Product name'],
    'Qarışdırılma' => ['ru' => 'Разведение', 'tr' => 'Seyreltme', 'en' => 'Dilution'],
    'Qablaşdırma' => ['ru' => 'Упаковка', 'tr' => 'Ambalaj', 'en' => 'Pack size'],
    'qab yuyan maşınlar üçün durulayıcı maddə' => ['ru' => 'ополаскиватель для посудомоечных машин', 'tr' => 'bulaşık makineleri için durulama maddesi', 'en' => 'rinse aid for dishwashers'],
    'Qab yuyan maşınlar üçün yuyucu maddə' => ['ru' => 'моющее средство для посудомоечных машин', 'tr' => 'bulaşık makineleri için deterjan', 'en' => 'detergent for dishwashers'],
    'qab yuyan maşınlar üçün yuyucu maddə' => ['ru' => 'моющее средство для посудомоечных машин', 'tr' => 'bulaşık makineleri için deterjan', 'en' => 'detergent for dishwashers'],
    'Mətbəx üçün kağız dəsmal' => ['ru' => 'Бумажное полотенце для кухни', 'tr' => 'Mutfak için kağıt havlu', 'en' => 'Kitchen paper towel'],
    'Professional içtən çəkmə kağız dəsmal' => ['ru' => 'Профессиональное бумажное полотенце с внутренней подачей', 'tr' => 'Profesyonel içten çekmeli kağıt havlu', 'en' => 'Professional centre-feed paper towel'],
    'Professional rulon kağız dəsmal' => ['ru' => 'Профессиональное рулонное бумажное полотенце', 'tr' => 'Profesyonel rulo kağıt havlu', 'en' => 'Professional paper towel roll'],
    'kağız dəsmal' => ['ru' => 'бумажное полотенце', 'tr' => 'kağıt havlu', 'en' => 'paper towel'],
    'tualet kağızı' => ['ru' => 'туалетная бумага', 'tr' => 'tuvalet kağıdı', 'en' => 'toilet paper'],
    'dispenseri' => ['ru' => 'дозатор', 'tr' => 'dispenseri', 'en' => 'dispenser'],
    'dispenser' => ['ru' => 'дозатор', 'tr' => 'dispenser', 'en' => 'dispenser'],
    'sabun' => ['ru' => 'мыло', 'tr' => 'sabun', 'en' => 'soap'],
    'köpük' => ['ru' => 'пенка', 'tr' => 'köpük', 'en' => 'foam'],
    'qara' => ['ru' => 'чёрный', 'tr' => 'siyah', 'en' => 'black'],
    'ağ' => ['ru' => 'белый', 'tr' => 'beyaz', 'en' => 'white'],
    'üçün' => ['ru' => 'для', 'tr' => 'için', 'en' => 'for'],
    'və' => ['ru' => 'и', 'tr' => 've', 'en' => 'and'],
    'ilə' => ['ru' => 'с', 'tr' => 'ile', 'en' => 'with'],
    'istifadə' => ['ru' => 'применение', 'tr' => 'kullanım', 'en' => 'use'],
    'səviyyəsi' => ['ru' => 'уровень', 'tr' => 'seviyesi', 'en' => 'level'],
    'dərəcəsi' => ['ru' => 'степень', 'tr' => 'derecesi', 'en' => 'degree'],
    'Dozalaşma' => ['ru' => 'Дозировка', 'tr' => 'Dozaj', 'en' => 'Dosage'],
    'yuyulması' => ['ru' => 'мойка', 'tr' => 'yıkanması', 'en' => 'washing'],
    'təmin' => ['ru' => 'обеспечивает', 'tr' => 'sağlar', 'en' => 'provides'],
    'vasitədir' => ['ru' => 'средство', 'tr' => 'üründür', 'en' => 'product'],
    'vasitə' => ['ru' => 'средство', 'tr' => 'ürün', 'en' => 'product'],
    'bilər' => ['ru' => 'может', 'tr' => 'edebilir', 'en' => 'can'],
    'təmizləyir' => ['ru' => 'очищает', 'tr' => 'temizler', 'en' => 'cleans'],
    'Xüsusiyyətləri' => ['ru' => 'Свойства', 'tr' => 'Özellikleri', 'en' => 'Features'],
    'kağız' => ['ru' => 'бумага', 'tr' => 'kâğıt', 'en' => 'paper'],
    'təmizlik' => ['ru' => 'уборка', 'tr' => 'temizlik', 'en' => 'cleaning'],
    'asanlıqla' => ['ru' => 'легко', 'tr' => 'kolayca', 'en' => 'easily'],
    'müəssisələrində' => ['ru' => 'на предприятиях', 'tr' => 'işletmelerde', 'en' => 'in facilities'],
    'davamlı' => ['ru' => 'прочный', 'tr' => 'dayanıklı', 'en' => 'durable'],
    'zamanı' => ['ru' => 'во время', 'tr' => 'sırasında', 'en' => 'during'],
    'İstifadə' => ['ru' => 'Использование', 'tr' => 'Kullanım', 'en' => 'Use'],
    'dəsmal' => ['ru' => 'полотенце', 'tr' => 'havlu', 'en' => 'towel'],
    'vedrə' => ['ru' => 'ведро', 'tr' => 'kova', 'en' => 'bucket'],
    'keyfiyyətli' => ['ru' => 'качественное', 'tr' => 'kaliteli', 'en' => 'quality'],
    'nəzərdə' => ['ru' => 'предназначено', 'tr' => 'için tasarlanmıştır', 'en' => 'intended'],
    'sayəsində' => ['ru' => 'благодаря', 'tr' => 'sayesinde', 'en' => 'thanks to'],
    'ləkələri' => ['ru' => 'пятна', 'tr' => 'lekeleri', 'en' => 'stains'],
    'əsaslı' => ['ru' => 'на основе', 'tr' => 'bazlı', 'en' => 'based'],
    'aparatı' => ['ru' => 'аппарат', 'tr' => 'cihazı', 'en' => 'unit'],
    'ədəd' => ['ru' => 'шт.', 'tr' => 'adet', 'en' => 'pcs'],
    'ağardıcı' => ['ru' => 'отбеливатель', 'tr' => 'ağartıcı', 'en' => 'bleach'],
    'Xəstəxanalar' => ['ru' => 'Больницы', 'tr' => 'Hastaneler', 'en' => 'Hospitals'],
    'fabriklər' => ['ru' => 'фабрики', 'tr' => 'fabrikalar', 'en' => 'factories'],
    'restoranlar' => ['ru' => 'рестораны', 'tr' => 'restoranlar', 'en' => 'restaurants'],
    'otellər' => ['ru' => 'отели', 'tr' => 'oteller', 'en' => 'hotels'],
    'sahələrində' => ['ru' => 'в зонах', 'tr' => 'alanlarında', 'en' => 'in areas'],
    'sənaye' => ['ru' => 'промышленный', 'tr' => 'endüstriyel', 'en' => 'industrial'],
    'qabyuyan' => ['ru' => 'посудомоечный', 'tr' => 'bulaşık', 'en' => 'dishwasher'],
    'maşınlarda' => ['ru' => 'в машинах', 'tr' => 'makinelerde', 'en' => 'in machines'],
    'maşınlarına' => ['ru' => 'к машинам', 'tr' => 'makinelerine', 'en' => 'to the machines'],
    'qoşulmuş' => ['ru' => 'подключённые', 'tr' => 'bağlı', 'en' => 'connected'],
    'nasosları' => ['ru' => 'насосы', 'tr' => 'pompaları', 'en' => 'pumps'],
    'yanında' => ['ru' => 'рядом с', 'tr' => 'yanında', 'en' => 'alongside'],
    'Döşəmə' => ['ru' => 'Пол', 'tr' => 'Zemin', 'en' => 'Floor'],
    'döşəmə' => ['ru' => 'пол', 'tr' => 'zemin', 'en' => 'floor'],
    'döşəmələr' => ['ru' => 'полы', 'tr' => 'zeminler', 'en' => 'floors'],
    'Şüşə' => ['ru' => 'Стекло', 'tr' => 'Cam', 'en' => 'Glass'],
    'şüşə' => ['ru' => 'стекло', 'tr' => 'cam', 'en' => 'glass'],
    'ticarət' => ['ru' => 'торговых', 'tr' => 'ticari', 'en' => 'commercial'],
    'mərkəzlərində' => ['ru' => 'в центрах', 'tr' => 'merkezlerinde', 'en' => 'in centres'],
    'dəfə' => ['ru' => 'раз', 'tr' => 'kez', 'en' => 'times'],
    'uyğundur' => ['ru' => 'подходит', 'tr' => 'uygundur', 'en' => 'is suitable'],
    'gündəlik' => ['ru' => 'ежедневный', 'tr' => 'günlük', 'en' => 'daily'],
    'hazırlanmışdır' => ['ru' => 'изготовлен', 'tr' => 'üretilmiştir', 'en' => 'is made'],
    'hazırlanıb' => ['ru' => 'подготовлен', 'tr' => 'hazırlanmıştır', 'en' => 'is prepared'],
    'hazırlanmış' => ['ru' => 'изготовленный', 'tr' => 'üretilmiş', 'en' => 'made'],
    'qarşısını' => ['ru' => 'предотвращает', 'tr' => 'önler', 'en' => 'prevents'],
    'Bütün' => ['ru' => 'Все', 'tr' => 'Tüm', 'en' => 'All'],
    'əhəng' => ['ru' => 'известь', 'tr' => 'kireç', 'en' => 'limescale'],
    'işləyir' => ['ru' => 'работает', 'tr' => 'çalışır', 'en' => 'works'],
    'rahatlığı' => ['ru' => 'удобство', 'tr' => 'konfor', 'en' => 'comfort'],
    'üzərindən' => ['ru' => 'по', 'tr' => 'üzerinden', 'en' => 'over'],
    'çətin' => ['ru' => 'сложный', 'tr' => 'zor', 'en' => 'difficult'],
    'çirkləri' => ['ru' => 'загрязнения', 'tr' => 'kirleri', 'en' => 'soils'],
    'qarşı' => ['ru' => 'против', 'tr' => 'karşı', 'en' => 'against'],
    'sərt' => ['ru' => 'твёрдый', 'tr' => 'sert', 'en' => 'hard'],
    'Alüminium' => ['ru' => 'Алюминий', 'tr' => 'Alüminyum', 'en' => 'Aluminium'],
    'arabası' => ['ru' => 'тележка', 'tr' => 'arabası', 'en' => 'trolley'],
    'Stolüstü' => ['ru' => 'Настольный', 'tr' => 'Tezgah tipi', 'en' => 'Countertop'],
    'başqa' => ['ru' => 'другой', 'tr' => 'başka', 'en' => 'other'],
    'digər' => ['ru' => 'другой', 'tr' => 'diğer', 'en' => 'other'],
    'çirklənmə' => ['ru' => 'загрязнение', 'tr' => 'kirlenme', 'en' => 'soiling'],
    'dəmir' => ['ru' => 'железо', 'tr' => 'demir', 'en' => 'iron'],
    'təmizləyən' => ['ru' => 'очищающий', 'tr' => 'temizleyen', 'en' => 'cleaning'],
    'təmizləyici' => ['ru' => 'очиститель', 'tr' => 'temizleyici', 'en' => 'cleaner'],
    'təmizləmə' => ['ru' => 'чистка', 'tr' => 'temizleme', 'en' => 'cleaning'],
    'peşəkar' => ['ru' => 'профессиональный', 'tr' => 'profesyonel', 'en' => 'professional'],
    'küvetlər' => ['ru' => 'ванны', 'tr' => 'küvetler', 'en' => 'tubs'],
    'turşu' => ['ru' => 'кислота', 'tr' => 'asit', 'en' => 'acid'],
    'xəstəxana' => ['ru' => 'больница', 'tr' => 'hastane', 'en' => 'hospital'],
    'torbası' => ['ru' => 'мешок', 'tr' => 'torbası', 'en' => 'bag'],
    'dəsti' => ['ru' => 'комплект', 'tr' => 'seti', 'en' => 'set'],
    'mövcuddur' => ['ru' => 'имеется', 'tr' => 'mevcuttur', 'en' => 'is available'],
    'qənaət' => ['ru' => 'экономия', 'tr' => 'tasarruf', 'en' => 'saving'],
    'Dayanıqlı' => ['ru' => 'Прочный', 'tr' => 'Dayanıklı', 'en' => 'Durable'],
    'quruluşu' => ['ru' => 'конструкция', 'tr' => 'yapısı', 'en' => 'structure'],
    'əllə' => ['ru' => 'вручную', 'tr' => 'elle', 'en' => 'by hand'],
    'tibbi' => ['ru' => 'медицинский', 'tr' => 'tıbbi', 'en' => 'medical'],
    'şəraitdə' => ['ru' => 'в условиях', 'tr' => 'koşullarda', 'en' => 'in conditions'],
    'çamaşırxanalarda' => ['ru' => 'в прачечных', 'tr' => 'çamaşırhanelerde', 'en' => 'in laundries'],
    'təsirli' => ['ru' => 'эффективный', 'tr' => 'etkili', 'en' => 'effective'],
    'konsentrat' => ['ru' => 'концентрат', 'tr' => 'konsantre', 'en' => 'concentrate'],
    'maye' => ['ru' => 'жидкий', 'tr' => 'sıvı', 'en' => 'liquid'],
    'xlorlu' => ['ru' => 'хлорный', 'tr' => 'klorlu', 'en' => 'chlorinated'],
    'boyasız' => ['ru' => 'неокрашенный', 'tr' => 'boyasız', 'en' => 'undyed'],
    'parçalarda' => ['ru' => 'на тканях', 'tr' => 'kumaşlarda', 'en' => 'on fabrics'],
    'Aşağı' => ['ru' => 'Низкая', 'tr' => 'Düşük', 'en' => 'Low'],
    'Orta' => ['ru' => 'Средняя', 'tr' => 'Orta', 'en' => 'Medium'],
    'Yüksək' => ['ru' => 'Высокая', 'tr' => 'Yüksek', 'en' => 'High'],
    'Su' => ['ru' => 'Вода', 'tr' => 'Su', 'en' => 'Water'],
    'peşəkar vasitədir' => ['ru' => 'это профессиональное средство', 'tr' => 'profesyonel bir üründür', 'en' => 'is a professional product'],
    'istifadə olunur' => ['ru' => 'используется', 'tr' => 'kullanılır', 'en' => 'is used'],
    'istifadə edilən' => ['ru' => 'используемое', 'tr' => 'kullanılan', 'en' => 'used'],
    'təmizlənməsi' => ['ru' => 'очистка', 'tr' => 'temizlenmesi', 'en' => 'cleaning'],
    'təmizlənilməsi' => ['ru' => 'удаление', 'tr' => 'temizlenmesi', 'en' => 'removal'],
    'yağsızlaşdırılması' => ['ru' => 'обезжиривание', 'tr' => 'yağdan arındırma', 'en' => 'degreasing'],
    'səthlərin' => ['ru' => 'поверхностей', 'tr' => 'yüzeylerin', 'en' => 'of surfaces'],
    'səthin' => ['ru' => 'поверхности', 'tr' => 'yüzeyin', 'en' => 'of the surface'],
    'mətbəx' => ['ru' => 'кухня', 'tr' => 'mutfak', 'en' => 'kitchen'],
    'qabyuyan' => ['ru' => 'посудомоечный', 'tr' => 'bulaşık', 'en' => 'dishwashing'],
    'yuyucu vasitə' => ['ru' => 'моющее средство', 'tr' => 'yıkama ürünü', 'en' => 'detergent'],
    'yuyucu maddə' => ['ru' => 'моющее средство', 'tr' => 'yıkama maddesi', 'en' => 'detergent'],
    'dezinfeksiya' => ['ru' => 'дезинфекция', 'tr' => 'dezenfeksiyon', 'en' => 'disinfection'],
    'gigiyena' => ['ru' => 'гигиена', 'tr' => 'hijyen', 'en' => 'hygiene'],
];
uksort($phrases, static fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));

function translateText(string $text, string $lang, array $phrases): string
{
    $out = $text;
    foreach ($phrases as $az => $map) {
        $pattern = '/(?<![\p{L}\p{N}])' . preg_quote($az, '/') . '(?![\p{L}\p{N}])/ui';
        $out = preg_replace($pattern, $map[$lang], $out) ?? $out;
    }
    return $out;
}

function corrupted(string $text): bool
{
    return (bool) preg_match('/whiteard|MəhWater|Водаlun|белыйard|kitchend|foamlən|əlaand|bıçwhite/u', $text);
}

function stillAzerbaijani(string $text, string $lang): bool
{
    if ($text === '') {
        return true;
    }
    return $lang === 'tr' ? (bool) preg_match('/ə/ui', $text) : (bool) preg_match('/[əğıöüşç]/ui', $text);
}

$updatedCats = 0;
foreach ($categories as $slug => $names) {
    $idStmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ?');
    $idStmt->execute([$slug]);
    $id = (int) $idStmt->fetchColumn();
    if (!$id) {
        continue;
    }
    $az = $pdo->prepare('SELECT name FROM category_translations WHERE category_id = ? AND lang = \'az\'');
    $az->execute([$id]);
    $azName = (string) $az->fetchColumn();
    foreach ($names as $lang => $name) {
        $cur = $pdo->prepare('SELECT name FROM category_translations WHERE category_id = ? AND lang = ?');
        $cur->execute([$id, $lang]);
        $current = $cur->fetchColumn();
        if ($current !== false && $current !== '' && $current !== $azName && $current !== $name) {
            continue;
        }
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT (category_id, lang) DO UPDATE SET name = EXCLUDED.name')->execute([$id, $lang, $name]);
        } else {
            $pdo->prepare('INSERT INTO category_translations (category_id, lang, name) VALUES (?, ?, ?) ON CONFLICT(category_id, lang) DO UPDATE SET name = excluded.name')->execute([$id, $lang, $name]);
        }
        $updatedCats++;
    }
}

$products = $pdo->query('SELECT p.id, az.name AS name, az.description AS description FROM products p JOIN product_translations az ON az.product_id = p.id AND az.lang = \'az\'')->fetchAll();
$updatedProducts = 0;
foreach ($products as $product) {
    foreach (['ru', 'tr', 'en'] as $lang) {
        $cur = $pdo->prepare('SELECT name, description FROM product_translations WHERE product_id = ? AND lang = ?');
        $cur->execute([(int) $product['id'], $lang]);
        $row = $cur->fetch() ?: ['name' => '', 'description' => ''];
        $name = (string) ($row['name'] ?? '');
        $desc = (string) ($row['description'] ?? '');
        $nextName = $name;
        $nextDesc = $desc;
        if ($name === '' || $name === $product['name'] || stillAzerbaijani($name, $lang) || corrupted($name)) {
            $nextName = translateText((string) $product['name'], $lang, $phrases);
        }
        if ($desc === '' || $desc === (string) $product['description'] || stillAzerbaijani($desc, $lang) || corrupted($desc)) {
            $nextDesc = translateText((string) $product['description'], $lang, $phrases);
        }
        if ($nextName === $name && $nextDesc === $desc) {
            continue;
        }
        if (Sql::isPgsql($pdo)) {
            $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT (product_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description')
                ->execute([(int) $product['id'], $lang, $nextName, $nextDesc]);
        } else {
            $pdo->prepare('INSERT INTO product_translations (product_id, lang, name, description) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, lang) DO UPDATE SET name = excluded.name, description = excluded.description')
                ->execute([(int) $product['id'], $lang, $nextName, $nextDesc]);
        }
        $updatedProducts++;
    }
}

echo "Categories updated: {$updatedCats}. Product language rows written: {$updatedProducts}.\n";
