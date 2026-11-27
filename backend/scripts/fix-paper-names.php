<?php
declare(strict_types=1);

$config = require dirname(__DIR__) . '/bootstrap.php';
$pdo = Faber\Database::connection($config);

$names = [
    'rulon-kagiz-dəsmal' => [
        'ru' => 'Рулон бумажных полотенец (21 см, 150 м)',
        'en' => 'Paper towel roll (21 cm, 150 m)',
        'tr' => 'Kağıt havlu rulosu (21 cm, 150 m)',
    ],
    'rulon-kagiz-dəsmal-1' => [
        'ru' => 'Рулон бумажных полотенец (21 см, 100 м)',
        'en' => 'Paper towel roll (21 cm, 100 m)',
        'tr' => 'Kağıt havlu rulosu (21 cm, 100 m)',
    ],
    'profesional-ictən-cəkmə-kagiz-dəsmal' => [
        'ru' => 'Профессиональное бумажное полотенце с внутренней подачей (2 слоя, 100 м)',
        'en' => 'Professional centre-feed paper towel (2-ply, 100 m)',
        'tr' => 'Profesyonel içten çekmeli kağıt havlu (2 kat, 100 m)',
    ],
    'profesional-ictən-cəkmə-kagiz-dəsmal-1' => [
        'ru' => 'Профессиональное бумажное полотенце с внутренней подачей (2 слоя, 150 м)',
        'en' => 'Professional centre-feed paper towel (2-ply, 150 m)',
        'tr' => 'Profesyonel içten çekmeli kağıt havlu (2 kat, 150 m)',
    ],
    'tualet-kagizi-2-qat' => [
        'ru' => 'Туалетная бумага (2 слоя, 150 м)',
        'en' => 'Toilet paper (2-ply, 150 m)',
        'tr' => 'Tuvalet kağıdı (2 kat, 150 m)',
    ],
    'fabex-tualet-kagizi-2-qat-130-yarpaq' => [
        'ru' => 'Туалетная бумага FABEX (2 слоя, 130 листов)',
        'en' => 'FABEX toilet paper (2-ply, 130 sheets)',
        'tr' => 'FABEX tuvalet kağıdı (2 kat, 130 yaprak)',
    ],
    'fabex-tualet-kagizi-3-qat-150-yarpaq' => [
        'ru' => 'Туалетная бумага FABEX (3 слоя, 150 листов)',
        'en' => 'FABEX toilet paper (3-ply, 150 sheets)',
        'tr' => 'FABEX tuvalet kağıdı (3 kat, 150 yaprak)',
    ],
    'z-katlama-havlu' => [
        'ru' => 'Салфетки Z-сложения для диспенсера (200 шт.)',
        'en' => 'Z-fold dispenser napkins (200 pcs)',
        'tr' => 'Dispenser için Z katlamalı peçete (200 adet)',
    ],
    'stolustu-dispenser-pecete' => [
        'ru' => 'Салфетки для настольного диспенсера (250 шт.)',
        'en' => 'Napkins for a countertop dispenser (250 pcs)',
        'tr' => 'Tezgah üstü dispenser için peçete (250 adet)',
    ],
    'servis-stolustu-salfet' => [
        'ru' => 'Сервировочные салфетки (25x25, 100 шт.)',
        'en' => 'Service napkins (25x25, 100 pcs)',
        'tr' => 'Servis peçetesi (25x25, 100 adet)',
    ],
    'stolustu-salfet-24x24-premium-2-qat' => [
        'ru' => 'Салфетки PREMIUM (2 слоя, 24x24, 200 шт.)',
        'en' => 'PREMIUM napkins (2-ply, 24x24, 200 pcs)',
        'tr' => 'PREMIUM peçete (2 kat, 24x24, 200 adet)',
    ],
    'stolustu-salfet-2-qat' => [
        'ru' => 'Салфетки PREMIUM (2 слоя, 30x30, 100 шт.)',
        'en' => 'PREMIUM napkins (2-ply, 30x30, 100 pcs)',
        'tr' => 'PREMIUM peçete (2 kat, 30x30, 100 adet)',
    ],
    'stolustu-salfet-qarson-katlama-2-qat' => [
        'ru' => 'Салфетки PREMIUM, сложение «гарсон» (2 слоя, 33x33, 250 шт.)',
        'en' => 'PREMIUM waiter-fold napkins (2-ply, 33x33, 250 pcs)',
        'tr' => 'PREMIUM garson katlamalı peçete (2 kat, 33x33, 250 adet)',
    ],
    'qutu-salfet-big' => [
        'ru' => 'Салфетки в коробке (2 слоя, 100 листов)',
        'en' => 'Boxed napkins (2-ply, 100 sheets)',
        'tr' => 'Kutulu peçete (2 kat, 100 yaprak)',
    ],
    'qutu-salfet-katric-big' => [
        'ru' => 'Салфетки в коробке (2 слоя, 150 листов)',
        'en' => 'Boxed napkins (2-ply, 150 sheets)',
        'tr' => 'Kutulu peçete (2 kat, 150 yaprak)',
    ],
    'mətbəx-havlusu' => [
        'ru' => 'Бумажное полотенце для кухни',
        'en' => 'Kitchen paper towel',
        'tr' => 'Mutfak için kağıt havlu',
    ],
    'professional-rulon-kagiz-dəsmal-selpak' => [
        'ru' => 'Рулон бумажных полотенец SELPAK (21,5 см, 135 м)',
        'en' => 'SELPAK paper towel roll (21.5 cm, 135 m)',
        'tr' => 'SELPAK kağıt havlu rulosu (21,5 cm, 135 m)',
    ],
];

$update = $pdo->prepare('UPDATE product_translations SET name = ? WHERE product_id = ? AND lang = ?');
$idOf = $pdo->prepare('SELECT id FROM products WHERE slug = ?');
$done = 0;
foreach ($names as $slug => $langs) {
    $idOf->execute([$slug]);
    $id = (int) $idOf->fetchColumn();
    if (!$id) {
        echo "missing {$slug}\n";
        continue;
    }
    foreach ($langs as $lang => $name) {
        $update->execute([$name, $id, $lang]);
        $done++;
    }
}

$towel = '/media/products/rulon-kagiz-dəsmal/0.jpg';
$image = $pdo->prepare('UPDATE product_images SET path = ? WHERE product_id = ?');
foreach (['rulon-kagiz-dəsmal-1', 'professional-rulon-kagiz-dəsmal-selpak', 'profesional-ictən-cəkmə-kagiz-dəsmal', 'profesional-ictən-cəkmə-kagiz-dəsmal-1', 'mətbəx-havlusu'] as $slug) {
    $idOf->execute([$slug]);
    $id = (int) $idOf->fetchColumn();
    if ($id) {
        $image->execute([$towel, $id]);
    }
}

$drop = $pdo->prepare('DELETE FROM product_images WHERE product_id = ?');
foreach ([
    'qutu-salfet-big',
    'qutu-salfet-katric-big',
    'stolustu-dispenser-pecete',
    'servis-stolustu-salfet',
    'stolustu-salfet-24x24-premium-2-qat',
    'stolustu-salfet-2-qat',
    'stolustu-salfet-qarson-katlama-2-qat',
    'z-katlama-havlu',
    'fabex-tualet-kagizi-2-qat-130-yarpaq',
    'fabex-tualet-kagizi-3-qat-150-yarpaq',
    'ictən-cəkmə-tualet-kagizi-mini-120mt',
    'unitaz-qapaq-ortuyu',
] as $slug) {
    $idOf->execute([$slug]);
    $id = (int) $idOf->fetchColumn();
    if ($id) {
        $drop->execute([$id]);
    }
}

echo "names updated: {$done}\n";
