const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/jinhaoke.db');
const db = new Database(dbPath);

try {
    console.log('正在更新菜單分類：便當 -> 手作便當...');
    const result = db.prepare("UPDATE menu_item SET category = '手作便當' WHERE category = '便當'").run();
    console.log(`更新完成，影響行數：${result.changes}`);

    console.log('正在修正歷史訂單日期格式：YYYYMMDD -> YYYY-MM-DD...');
    // 找出所有長度為 8 且全是數字的 order_date
    const orders = db.prepare("SELECT order_id, order_date FROM \"order\" WHERE length(order_date) = 8").all();
    let updatedOrders = 0;
    
    const updateStmt = db.prepare("UPDATE \"order\" SET order_date = ? WHERE order_id = ?");
    
    db.transaction(() => {
        for (const order of orders) {
            const date = order.order_date;
            if (/^\d{8}$/.test(date)) {
                const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
                updateStmt.run(formattedDate, order.order_id);
                updatedOrders++;
            }
        }
    })();
    
    console.log(`日期格式修正完成，更新筆數：${updatedOrders}`);

} catch (err) {
    console.error('更新失敗：', err);
} finally {
    db.close();
}
