// US 1.1 — DROPDOWN + FORM DINAMIS
document.addEventListener('DOMContentLoaded', function () {
    // Simpan referensi elemen DOM sesuai ID yang diminta di tugas
    const curveSelect = document.getElementById('curve-type');
    const paramContainer = document.getElementById('parameter-inputs');
    const processBtn = document.getElementById('process-btn');
    
    // Cari elemen untuk pesan info (bisa pakai elemen p atau div di HTML temenmu)
    // Kalau temenmu belum bikin id-nya, kita buat logic aman biar nggak error
    const infoText = document.getElementById('info-text') || document.createElement('div');

    function getParamDefs(curveType) {
        // Parameter dasar yang ada di semua kurva (Xc, Yc)
        const baseParams = [
            { id: 'xc', label: 'Xc', value: 0 },
            { id: 'yc', label: 'Yc', value: 0 },
        ];

        switch (curveType) {
            case 'circle':
                return [...baseParams, 
                    { id: 'r', label: 'r', value: 100 },
                    { id: 'delta', label: 'delta', value: 0.05 },
                    { id: 'tMin', label: 'tMin', value: 0 },
                    { id: 'tMax', label: 'tMax', value: 6.2832 }
                ];
            case 'ellipse':
                return [...baseParams,
                    { id: 'a', label: 'a', value: 150 },
                    { id: 'b', label: 'b', value: 80 },
                    { id: 'delta', label: 'delta', value: 0.1 },
                    { id: 'tMin', label: 'tMin', value: -10 },
                    { id: 'tMax', label: 'tMax', value: 10 }
                ];
            case 'parabola':
                return [...baseParams,
                    { id: 'a', label: 'a', value: 2 },
                    { id: 'delta', label: 'delta', value: 0.1 },
                    { id: 'tMin', label: 'tMin', value: -3 },
                    { id: 'tMax', label: 'tMax', value: 3 }
                ];
            case 'hyperbola':
                return [...baseParams,
                    { id: 'a', label: 'a', value: 80 },
                    { id: 'b', label: 'b', value: 60 },
                    { id: 'delta', label: 'delta', value: 0.1 },
                    { id: 'tMin', label: 'tMin', value: -3 },
                    { id: 'tMax', label: 'tMax', value: 3 }
                ];
            default:
                return [];
        }
    }

    function renderParams(curveType) {
        // Kosongkan form input sebelumnya
        if(paramContainer) paramContainer.innerHTML = '';

        // Kalau belum milih kurva, matikan tombol Proses Gambar
        if (!curveType) {
            if(processBtn) processBtn.disabled = true;
            infoText.style.display = 'block';
            return;
        }

        // Kalau kurva dipilih, nyalakan tombol
        infoText.style.display = 'none';
        if(processBtn) processBtn.disabled = false;

        // Render input HTML sesuai tipe kurva
        const params = getParamDefs(curveType);
        
        params.forEach(param => {
            const div = document.createElement('div');
            div.className = 'param-item'; // Mengikuti class dari CSS temenmu
            div.innerHTML = `
                <label for="${param.id}">${param.label}</label>
                <input type="number" id="${param.id}" value="${param.value}" step="any">
            `;
            paramContainer.appendChild(div);
        });
    }

    // Pasang alat pendengar (event listener) kalau dropdown-nya diganti
    if(curveSelect) {
        curveSelect.addEventListener('change', function(e) {
            renderParams(e.target.value);
        });
        
        // Panggil saat pertama kali web dibuka
        renderParams(curveSelect.value);
    }
});
// US 1.2 — VALIDASI + PROSES GAMBAR
// US 2.2 — PANEL ANALISIS
