update shop_items
set currency = 'exp', stock = 0
where name = 'Treasure Chest' and price = 200 and currency = 'coins';
