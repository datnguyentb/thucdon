document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo dữ liệu với các ô bữa ăn trống
    const menuData = {
        header: {
            thu: '',
            ngay: '',
            thang: '',
            nam: '2025',
            soLuongHs: '',
            tongThuHs: ''
        },

        buaAn: {
            sang: [{}],
            trua: [{}],
            chieu: [{}]
        }
    };
    
    const menuBody = document.getElementById('menu-body');
    const tongCongCell = document.getElementById('tong-cong');

    // Thêm các nút mới vào HTML
    const container = document.querySelector('.container');
    const actionButtons = document.createElement('div');
    actionButtons.style.textAlign = 'center';
    actionButtons.style.marginTop = '20px';
    actionButtons.innerHTML = `
        <button id="save-csv-btn" class="add-row-btn">Lưu File CSV</button>
        <label for="load-csv-file" class="add-row-btn" style="cursor:pointer; padding: 5px 10px;">Xem Lại</label>
        <input type="file" id="load-csv-file" accept=".csv" style="display:none;">
        <button id="print-btn" class="add-row-btn">In</button>
    `;

    container.appendChild(actionButtons);

    function renderHeader() {
        document.getElementById('thu').value = menuData.header.thu;
        document.getElementById('ngay').value = menuData.header.ngay;
        document.getElementById('thang').value = menuData.header.thang;
        document.getElementById('nam').value = menuData.header.nam;
        document.getElementById('tongThuHs').value = menuData.header.tongThuHs;
    }

    function renderTable() {
        menuBody.innerHTML = '';
        
        for (const buaAn in menuData.buaAn) {
            const buaAnItems = menuData.buaAn[buaAn];
            
            buaAnItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.setAttribute('data-bua-an', buaAn);
                
                const thucPhamValue = item.thucPham || '';
                const donViValue = item.donVi || '';
                const soLuongValue = item.soLuong !== undefined ? item.soLuong : '';
                const donGiaValue = item.donGia !== undefined ? item.donGia : '';
                
                if (index === 0) {
                    row.innerHTML = `
                        <td class="stt-cell"></td>
                        <td class="bua-an-cell" rowspan="${buaAnItems.length}">${buaAn.charAt(0).toUpperCase() + buaAn.slice(1)}</td>
                        <td><input type="text" class="thuc-pham-input" placeholder="Nhập tên" value="${thucPhamValue}"></td>
                        <td><input type="text" class="don-vi-input" placeholder="Nhập đơn vị" value="${donViValue}"></td>
                        <td><input type="number" class="so-luong" placeholder="Nhập số lượng" value="${soLuongValue}"></td>
                        <td><input type="number" class="don-gia" placeholder="Nhập đơn giá" value="${donGiaValue}"></td>
                        <td class="tong-tien"></td>
                        <td class="action-cell"><button class="delete-row-btn">Xóa</button></td>
                    `;
                } else {
                    row.innerHTML = `
                        <td class="stt-cell"></td>
                        <td><input type="text" class="thuc-pham-input" placeholder="Nhập tên" value="${thucPhamValue}"></td>
                        <td><input type="text" class="don-vi-input" placeholder="Nhập đơn vị" value="${donViValue}"></td>
                        <td><input type="number" class="so-luong" placeholder="Nhập số lượng" value="${soLuongValue}"></td>
                        <td><input type="number" class="don-gia" placeholder="Nhập đơn giá" value="${donGiaValue}"></td>
                        <td class="tong-tien"></td>
                        <td class="action-cell"><button class="delete-row-btn">Xóa</button></td>
                    `;
                }
                menuBody.appendChild(row);
            });
            
            const addRowBtn = document.createElement('tr');
            addRowBtn.innerHTML = `<td colspan="8" style="text-align: center;"><button class="add-row-btn" data-bua-an="${buaAn}">Thêm món ăn ${buaAn.charAt(0).toUpperCase() + buaAn.slice(1)}</button></td>`;
            menuBody.appendChild(addRowBtn);
        }
        
        updateTable();
    }

    function updateTable() {
        let tongCong = 0;
        let buaAnRows = {};

        document.querySelectorAll('#menu-body tr[data-bua-an]').forEach(row => {
            const buaAn = row.getAttribute('data-bua-an');
            if (!buaAnRows[buaAn]) {
                buaAnRows[buaAn] = [];
            }
            buaAnRows[buaAn].push(row);

            const soLuong = parseFloat(row.querySelector('.so-luong').value) || 0;
            const donGia = parseFloat(row.querySelector('.don-gia').value) || 0;
            const tongTien = soLuong * donGia;
            row.querySelector('.tong-tien').textContent = tongTien.toLocaleString('vi-VN');
            tongCong += tongTien;
        });

        for (const buaAn in buaAnRows) {
            const rows = buaAnRows[buaAn];
            if (rows.length > 0) {
                const buaAnCell = rows[0].querySelector('.bua-an-cell');
                if (buaAnCell) {
                    buaAnCell.rowSpan = rows.length;
                }
                rows.forEach((row, index) => {
                    row.querySelector('.stt-cell').textContent = index + 1;
                });
            }
        }
        
        tongCongCell.textContent = tongCong.toLocaleString('vi-VN');
    }

    function deleteRow(event) {
        const row = event.target.closest('tr');
        const buaAn = row.getAttribute('data-bua-an');
        const rowIndex = Array.from(menuBody.querySelectorAll(`tr[data-bua-an="${buaAn}"]`)).indexOf(row);
        
        if (menuData.buaAn[buaAn].length > 1) {
            menuData.buaAn[buaAn].splice(rowIndex, 1);
            renderTable();
        } else {
            alert('Không thể xóa món ăn cuối cùng của một bữa!');
        }
    }
    
    function addRow(event) {
        const buaAn = event.target.dataset.buaAn;
        const newItem = {
            thucPham: '',
            donVi: '',
            soLuong: '',
            donGia: ''
        };
        menuData.buaAn[buaAn].push(newItem);
        renderTable();
    }

    // Hàm để chuyển đổi dữ liệu thành CSV
    function convertToCsv() {
        let csv = '';
        // Thêm thông tin header
        for (const key in menuData.header) {
            csv += `${key},"${menuData.header[key]}"\n`;
        }
        csv += '\n'; // Thêm dòng trống

        // Thêm tiêu đề bảng
        csv += 'BỮA ĂN,STT,THỰC PHẨM,ĐƠN VỊ,SỐ LƯỢNG,ĐƠN GIÁ,TỔNG SỐ TIỀN\n';

        // Thêm dữ liệu từ bảng
        let tongCong = 0;
        for (const buaAn in menuData.buaAn) {
            menuData.buaAn[buaAn].forEach((item, index) => {
                const tongTien = (parseFloat(item.soLuong) || 0) * (parseFloat(item.donGia) || 0);
                tongCong += tongTien;
                csv += `${buaAn.toUpperCase()},${index + 1},"${item.thucPham || ''}","${item.donVi || ''}",${item.soLuong || ''},${item.donGia || ''},${tongTien}\n`;
            });
        }
        csv += `\n,,,,,Tổng cộng,${tongCong}\n`;
        return csv;
    }

    // Hàm để lưu file CSV
    function saveCsv() {
    const csvContent = convertToCsv();
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // Lấy ngày/tháng/năm từ header
    const ngay = menuData.header.ngay || 'dd';
    const thang = menuData.header.thang || 'mm';
    const nam = menuData.header.nam || 'yyyy';

    // Đặt tên file theo định dạng dd-mm-yyyy
    link.setAttribute('download', `thuc_don_${ngay}-${thang}-${nam}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


    // Hàm để tải dữ liệu từ CSV và hiển thị
    function loadCsv(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const lines = content.split('\n');

            // Xử lý dữ liệu header (nếu cần)
            const headerData = {};
            let tableStartIndex = 0;
            for(let i=0; i < lines.length; i++) {
                if (lines[i].includes('BỮA ĂN,STT')) {
                    tableStartIndex = i + 1;
                    break;
                }
                const parts = lines[i].split(',');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts[1].replace(/"/g, '').trim();
                    headerData[key] = value;
                }
            }
            // Cập nhật header từ file CSV
            for (const key in headerData) {
                if (menuData.header.hasOwnProperty(key)) {
                    menuData.header[key] = headerData[key];
                }
            }

            // Xử lý dữ liệu bảng
            menuData.buaAn = { sang: [], trua: [], chieu: [] };
            for(let i = tableStartIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.length === 0 || line.includes('Tổng cộng')) continue;
                
                const parts = line.split(',');
                if (parts.length >= 6) {
                    const buaAn = parts[0].toLowerCase();
                    const thucPham = parts[2].replace(/"/g, '').trim();
                    const donVi = parts[3].replace(/"/g, '').trim();
                    const soLuong = parts[4] ? parseFloat(parts[4]) : '';
                    const donGia = parts[5] ? parseFloat(parts[5]) : '';
                    
                    if (menuData.buaAn.hasOwnProperty(buaAn)) {
                        menuData.buaAn[buaAn].push({ thucPham, donVi, soLuong, donGia });
                    }
                }
            }
            renderHeader();
            renderTable();
        };
        reader.readAsText(file, 'UTF-8');
    }

    // Gắn sự kiện cho các nút mới
    document.getElementById('save-csv-btn').addEventListener('click', saveCsv);
    document.getElementById('load-csv-file').addEventListener('change', loadCsv);
    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });


    menuBody.addEventListener('input', (event) => {
        const row = event.target.closest('tr');
        if (!row) return;
        const buaAn = row.getAttribute('data-bua-an');
        const rowIndex = Array.from(menuBody.querySelectorAll(`tr[data-bua-an="${buaAn}"]`)).indexOf(row);
        if (rowIndex === -1) return;
        
        const item = menuData.buaAn[buaAn][rowIndex];
        
        if (event.target.classList.contains('so-luong')) {
            item.soLuong = parseFloat(event.target.value) || 0;
        } else if (event.target.classList.contains('don-gia')) {
            item.donGia = parseFloat(event.target.value) || 0;
        } else if (event.target.classList.contains('thuc-pham-input')) {
            item.thucPham = event.target.value;
        } else if (event.target.classList.contains('don-vi-input')) {
            item.donVi = event.target.value;
        }
        updateTable();
    });
    
    menuBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-row-btn')) {
            deleteRow(event);
        } else if (event.target.classList.contains('add-row-btn')) {
            addRow(event);
        }
    });

    document.querySelectorAll('#thu, #ngay, #thang, #nam, #soLuongHs, #tongThuHs, #nguoiNhan, #nguoiLen, #nguoiGiao').forEach(input => {
        input.addEventListener('input', (event) => {
            menuData.header[event.target.id] = event.target.value;
        });
    });


    renderHeader();
    renderTable();
});