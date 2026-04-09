document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const imageUploadUrl = document.getElementById('image-upload');
    const mainImg = document.getElementById('main-img');
    const thumbnailImg = document.getElementById('thumbnail-img');
    const workspace = document.getElementById('workspace');
    const boxesContainer = document.getElementById('bounding-boxes-container');
    const emptyState = document.querySelector('.empty-state');
    
    // Stats elements
    const systemStatus = document.getElementById('system-status');
    const confidenceScore = document.getElementById('confidence-score');
    const totalCountText = document.getElementById('total-count-text');
    const poleTypeText = document.getElementById('pole-type-text');
    const statCategory = document.getElementById('stat-category');
    const statCount = document.getElementById('stat-count');
    const statDetails = document.getElementById('stat-details');

    const filterBtns = document.querySelectorAll('.filter-btn');

    let currentBoxes = [];
    let activeFilters = {
        transformer: true,
        insulator: true,
        crossarm: true,
        fuse: true
    };

    uploadBtn.addEventListener('click', () => {
        imageUploadUrl.click();
    });

    imageUploadUrl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgData = event.target.result;
                mainImg.src = imgData;
                thumbnailImg.src = imgData;
                
                mainImg.style.display = 'block';
                thumbnailImg.style.display = 'block';
                emptyState.style.display = 'none';
                document.querySelector('.thumbnail-placeholder').style.display = 'none';
                
                // Reset setup
                boxesContainer.innerHTML = '';
                systemStatus.textContent = 'กำลังประมวลผล AI...';
                systemStatus.style.color = '#f59e0b'; // orange
                confidenceScore.textContent = 'Calculataing...';
                
                // Create scan line
                const scanLine = document.createElement('div');
                scanLine.className = 'scan-line';
                scanLine.style.display = 'block';
                workspace.appendChild(scanLine);

                // Simulate processing time
                setTimeout(() => {
                    setTimeout(() => {
                        scanLine.remove();
                        systemStatus.textContent = 'พร้อมตรวจจับ (ตรวจพบแล้ว)';
                        systemStatus.style.color = '#4ade80'; // green
                        confidenceScore.textContent = '[High 94.2%]';
                        
                        generateMockDetection(mainImg);
                    }, 100);
                }, 2000);
            };
            reader.readAsDataURL(file);
        }
    });

    // Mock data generator
    function generateMockDetection(imgElement) {
        // Calculate rendered size
        const rect = imgElement.getBoundingClientRect();
        const containerRect = boxesContainer.getBoundingClientRect();
        
        // Calculate offsets to center boxes properly relative to the image
        const offsetX = (containerRect.width - rect.width) / 2;
        const offsetY = (containerRect.height - rect.height) / 2;

        // Mock boxes data (relative percentages 0-1) - based on an electricity pole structure typical in photos
        const mockData = [
            { id: 1, type: 'transformer', name: 'หม้อแปลง', color: '#32cd32', x: 0.45, y: 0.55, w: 0.12, h: 0.20, detail: 'อุปกรณ์แปลงแรงดันไฟฟ้าเพื่อแจกจ่าย' },
            { id: 2, type: 'transformer', name: 'หม้อแปลง', color: '#32cd32', x: 0.60, y: 0.52, w: 0.11, h: 0.19, detail: 'อุปกรณ์แปลงแรงดันไฟฟ้าเพื่อแจกจ่าย' },
            { id: 3, type: 'insulator', name: 'ลูกถ้วยฉนวน', color: '#00ced1', x: 0.40, y: 0.25, w: 0.05, h: 0.08, detail: 'ลูกถ้วยรองรับสายไฟแรงสูง' },
            { id: 4, type: 'insulator', name: 'ลูกถ้วยฉนวน', color: '#00ced1', x: 0.55, y: 0.22, w: 0.05, h: 0.08, detail: 'ลูกถ้วยรองรับสายไฟแรงสูง' },
            { id: 5, type: 'insulator', name: 'ลูกถ้วยฉนวน', color: '#00ced1', x: 0.70, y: 0.20, w: 0.05, h: 0.08, detail: 'ลูกถ้วยรองรับสายไฟแรงสูง' },
            { id: 6, type: 'crossarm', name: 'คอนเสา', color: '#daa520', x: 0.38, y: 0.30, w: 0.35, h: 0.04, detail: 'เหล็กคอนสายไฟสำหรับยึดลูกถ้วย' },
            { id: 7, type: 'crossarm', name: 'คอนเสา', color: '#daa520', x: 0.35, y: 0.45, w: 0.40, h: 0.04, detail: 'เหล็กคอนเสารองรับอุปกรณ์' },
            { id: 8, type: 'fuse', name: 'ฐานฟิวส์', color: '#ba55d3', x: 0.42, y: 0.35, w: 0.04, h: 0.09, detail: 'อุปกรณ์ตัดตอน (Drop Out Fuse)' },
            { id: 9, type: 'fuse', name: 'ฐานฟิวส์', color: '#ba55d3', x: 0.58, y: 0.33, w: 0.04, h: 0.09, detail: 'อุปกรณ์ตัดตอน (Drop Out Fuse)' },
            { id: 10, type: 'fuse', name: 'ฐานฟิวส์', color: '#ba55d3', x: 0.74, y: 0.31, w: 0.04, h: 0.09, detail: 'อุปกรณ์ตัดตอน (Drop Out Fuse)' },
        ];

        currentBoxes = [];

        // Build predefined core boxes
        mockData.forEach(data => {
            createBoxElement(data, rect, offsetX, offsetY);
        });

        // Scatter 12 additional random boxes to reach "22" total like the image shows
        scatterExtraBoxes(rect, offsetX, offsetY);

        updateStats();
    }

    function createBoxElement(data, rect, offsetX, offsetY) {
        const boxDiv = document.createElement('div');
        boxDiv.className = `bounding-box box-${data.type}`;
        
        // Ensure values are within bounds
        const safeX = Math.max(0, Math.min(0.9, data.x));
        const safeY = Math.max(0, Math.min(0.9, data.y));
        const safeW = Math.max(0.02, Math.min(0.5, data.w));
        const safeH = Math.max(0.02, Math.min(0.5, data.h));

        // Calculate absolute position
        const bX = offsetX + (safeX * rect.width);
        const bY = offsetY + (safeY * rect.height);
        const bW = safeW * rect.width;
        const bH = safeH * rect.height;

        boxDiv.style.left = `${bX}px`;
        boxDiv.style.top = `${bY}px`;
        boxDiv.style.width = `${bW}px`;
        boxDiv.style.height = `${bH}px`;
        boxDiv.style.borderColor = data.color;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'box-label';
        labelDiv.style.backgroundColor = data.color;
        labelDiv.textContent = data.name;

        boxDiv.appendChild(labelDiv);
        boxesContainer.appendChild(boxDiv);

        // Click event to show stats
        boxDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            statCategory.textContent = data.name;
            statCount.textContent = '1 ชิ้น (เลือกดูอยู่)';
            statDetails.textContent = data.detail;
            
            // Highlight box
            document.querySelectorAll('.bounding-box').forEach(b => {
                b.style.zIndex = '1';
                b.style.boxShadow = 'none';
            });
            boxDiv.style.zIndex = '10';
            boxDiv.style.boxShadow = `0 0 12px 2px ${data.color}`;
        });

        currentBoxes.push({ element: boxDiv, data: data });
    }

    function scatterExtraBoxes(rect, offsetX, offsetY) {
        // Add random boxes to reach 22 count
        const types = [
            {type:'insulator', name:'ลูกถ้วยฉนวน', color:'#00ced1', detail:'ระบุอัตโนมัติ'},
            {type:'fuse', name:'ฐานฟิวส์', color:'#ba55d3', detail:'ระบุอัตโนมัติ'},
            {type:'crossarm', name:'คอนเสา', color:'#daa520', detail:'ระบุอัตโนมัติ'}
        ];
        
        for(let i=11; i<=22; i++) {
            const t = types[Math.floor(Math.random()*types.length)];
            const data = {
                id: i, type: t.type, name: t.name, color: t.color,
                x: 0.15 + (Math.random() * 0.7),
                y: 0.1 + (Math.random() * 0.7),
                w: 0.03 + (Math.random() * 0.06),
                h: 0.04 + (Math.random() * 0.08),
                detail: t.detail
            };
            createBoxElement(data, rect, offsetX, offsetY);
        }
    }

    function updateStats() {
        const visibleBoxes = currentBoxes.filter(b => activeFilters[b.data.type]);
        totalCountText.textContent = `จำนวนอุปกรณ์ทั้งหมด: ${visibleBoxes.length} ชิ้น`;
        poleTypeText.textContent = 'ประเภทเสา (ประมาณการ): การกระจายไฟฟ้าแรงต่ำ/ปานกลาง';
        
        // Default text if nothing clicked
        statCategory.textContent = 'หม้อแปลง';
        const tCount = currentBoxes.filter(b => b.data.type === 'transformer').length;
        statCount.textContent = `${tCount} ชิ้น`;
        statDetails.textContent = 'อุปกรณ์แปลงแรงดันไฟฟ้าเพื่อแจกจ่าย';
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            if (filter === 'all') {
                filterBtns.forEach(b => {
                    if(b.getAttribute('data-filter') !== 'all') {
                        b.classList.add('active');
                        b.style.opacity = '1';
                        activeFilters[b.getAttribute('data-filter')] = true;
                    }
                });
                btn.classList.add('active');
            } else {
                // Toggle specific filter
                btn.classList.toggle('active');
                activeFilters[filter] = btn.classList.contains('active');
                
                if(!btn.classList.contains('active')) {
                    btn.style.opacity = '0.5';
                } else {
                    btn.style.opacity = '1';
                }
                
                // Remove 'all' active state if any is unchecked
                document.querySelector('[data-filter="all"]').classList.remove('active');
                
                // Check if ALL are checked. If so, activate 'all' button
                let allChecked = true;
                document.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(b => {
                    if(!b.classList.contains('active')) allChecked = false;
                });
                if(allChecked) {
                    document.querySelector('[data-filter="all"]').classList.add('active');
                }
            }

            // Update UI boxes
            currentBoxes.forEach(item => {
                if (activeFilters[item.data.type]) {
                    item.element.style.display = 'block';
                } else {
                    item.element.style.display = 'none';
                }
            });
            
            updateStats();
        });
    });
    
    // Window resize handling to reposition boxes
    window.addEventListener('resize', () => {
        if(mainImg.style.display === 'block') {
            const rect = mainImg.getBoundingClientRect();
            const containerRect = boxesContainer.getBoundingClientRect();
            const offsetX = (containerRect.width - rect.width) / 2;
            const offsetY = (containerRect.height - rect.height) / 2;
            
            currentBoxes.forEach(item => {
                // use recalculation logic cleanly
                const safeX = Math.max(0, Math.min(0.9, item.data.x));
                const safeY = Math.max(0, Math.min(0.9, item.data.y));
                const safeW = Math.max(0.02, Math.min(0.5, item.data.w));
                const safeH = Math.max(0.02, Math.min(0.5, item.data.h));

                const bX = offsetX + (safeX * rect.width);
                const bY = offsetY + (safeY * rect.height);
                const bW = safeW * rect.width;
                const bH = safeH * rect.height;

                item.element.style.left = `${bX}px`;
                item.element.style.top = `${bY}px`;
                item.element.style.width = `${bW}px`;
                item.element.style.height = `${bH}px`;
            });
        }
    });

    // Deselect box click
    workspace.addEventListener('click', () => {
        document.querySelectorAll('.bounding-box').forEach(b => {
            b.style.boxShadow = 'none';
        });
        updateStats(); // reset stats view to default
    });
});
