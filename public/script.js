// --- Unit Conversion ---
const UNITS = {
    metric: {
        dist: "m",
        speed: "m/s",
        press: "kPa",
        density: "kg/m³"
    },
    imperial: {
        dist: "ft",
        speed: "mph",
        press: "psf",
        density: "lb/ft³"
    }
};

const CONV = {
    m_to_ft: 3.28084,
    ms_to_mph: 2.23694,
    pa_to_psf: 0.0208854,
    kgm3_to_lbft3: 0.062428,
};

let currentSystem = 'metric';

document.querySelectorAll('input[name="units"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const oldSystem = currentSystem;
        currentSystem = e.target.value;
        updateUnitLabels();
        convertInputs(oldSystem, currentSystem);
    });
});

function updateUnitLabels() {
    const u = UNITS[currentSystem];
    document.querySelector('label[for="vb0"]').innerHTML = `Basic Wind Speed (v<sub>b,0</sub>) [${u.speed}]`;
    document.querySelector('label[for="h"]').innerHTML = `Building Height (h) [${u.dist}]`;
    document.querySelector('label[for="d"]').innerHTML = `Building Depth (d) [${u.dist}]`;
    document.querySelector('label[for="w"]').innerHTML = `Building Width (w) [${u.dist}]`;
    const s = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    s('lbl-vb0-unit', `[${u.speed}]`);
    s('lbl-h-unit',   `[${u.dist}]`);
    s('lbl-d-unit',   `[${u.dist}]`);
    s('lbl-w-unit',   `[${u.dist}]`);
    s('lbl-z-unit',   `[${u.dist}]`);
    s('lbl-rho-unit', `[${u.density}]`);
    // result units
    s('res-qp-unit',  u.press);
    s('res-vm-unit',  u.speed);
    s('res-net-unit', u.press);
}

function convertInputs(from, to) {
    if (from === to) return;
    
    const vb0 = document.getElementById('vb0');
    const h = document.getElementById('h');
    const d = document.getElementById('d');
    const w = document.getElementById('w');
    const z = document.getElementById('z');
    const rho = document.getElementById('rho');

    if (to === 'imperial') {
        vb0.value = (parseFloat(vb0.value) * CONV.ms_to_mph).toFixed(1);
        h.value = (parseFloat(h.value) * CONV.m_to_ft).toFixed(1);
        d.value = (parseFloat(d.value) * CONV.m_to_ft).toFixed(1);
        w.value = (parseFloat(w.value) * CONV.m_to_ft).toFixed(1);
        z.value = (parseFloat(z.value) * CONV.m_to_ft).toFixed(1);
        rho.value = (parseFloat(rho.value) * CONV.kgm3_to_lbft3).toFixed(3);
    } else {
        vb0.value = (parseFloat(vb0.value) / CONV.ms_to_mph).toFixed(1);
        h.value = (parseFloat(h.value) / CONV.m_to_ft).toFixed(1);
        d.value = (parseFloat(d.value) / CONV.m_to_ft).toFixed(1);
        w.value = (parseFloat(w.value) / CONV.m_to_ft).toFixed(1);
        z.value = (parseFloat(z.value) / CONV.m_to_ft).toFixed(1);
        rho.value = (parseFloat(rho.value) / CONV.kgm3_to_lbft3).toFixed(2);
    }
}

// --- Tab switching ---
document.getElementById('tab-params').addEventListener('click', () => {
    document.getElementById('pane-params').style.display = '';
    document.getElementById('pane-projects').style.display = 'none';
    document.getElementById('tab-params').classList.add('active');
    document.getElementById('tab-projects').classList.remove('active');
});
document.getElementById('tab-projects').addEventListener('click', () => {
    document.getElementById('pane-projects').style.display = '';
    document.getElementById('pane-params').style.display = 'none';
    document.getElementById('tab-projects').classList.add('active');
    document.getElementById('tab-params').classList.remove('active');
    loadProjects();
});

// --- Map Visualizer Setup ---
let windMap, mapInitialized = false;

const cities = [
    { name: "Paris, FR", coords: [48.8566, 2.3522], vb0: 24.0 },
    { name: "London, UK", coords: [51.5074, -0.1278], vb0: 22.0 },
    { name: "Berlin, DE", coords: [52.5200, 13.4050], vb0: 22.5 },
    { name: "Madrid, ES", coords: [40.4168, -3.7038], vb0: 26.0 },
    { name: "Rome, IT", coords: [41.9028, 12.4964], vb0: 25.0 },
    { name: "Brussels, BE", coords: [50.8503, 4.3517], vb0: 23.0 },
    { name: "Amsterdam, NL", coords: [52.3676, 4.9041], vb0: 24.5 },
    { name: "Dublin, IE", coords: [53.3498, -6.2603], vb0: 26.0 },
    { name: "Copenhagen, DK", coords: [55.6761, 12.5683], vb0: 24.0 },
    { name: "Vienna, AT", coords: [48.2082, 16.3738], vb0: 22.0 }
];

function initMap() {
    if (mapInitialized) return;
    
    windMap = L.map('wind-map').setView([48.0, 10.0], 4);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(windMap);

    cities.forEach(city => {
        const marker = L.circleMarker(city.coords, {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(windMap);

        marker.bindPopup(`
            <div style="color: #0f172a; font-family: 'Outfit', sans-serif;">
                <strong style="font-size: 1.1rem;">${city.name}</strong><br>
                <span style="font-size: 0.9rem;">Basic Wind Speed: <strong>${city.vb0} m/s</strong></span><br>
                <button onclick="selectWindSpeed(${city.vb0})" style="margin-top: 8px; width: 100%; background: #3b82f6; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Select</button>
            </div>
        `);
    });

    mapInitialized = true;
}

function selectWindSpeed(val) {
    document.getElementById('vb0').value = val;
    closeMap();
}

// Global expose for onclick in popup
window.selectWindSpeed = selectWindSpeed;

const mapModal = document.getElementById('map-modal');
const openMapBtn = document.getElementById('open-map-btn');
const closeMapBtn = document.getElementById('close-map-btn');

function openMap() {
    mapModal.classList.add('active');
    initMap();
    // Invalidate size helps Leaflet fix tiles when shown in a hidden container
    setTimeout(() => windMap.invalidateSize(), 100);
}

function closeMap() {
    mapModal.classList.remove('active');
}

openMapBtn.addEventListener('click', openMap);
document.getElementById('map-btn-inline').addEventListener('click', openMap);
closeMapBtn.addEventListener('click', closeMap);

// Close modal on click outside
window.addEventListener('click', (e) => {
    if (e.target === mapModal) closeMap();
});

// --- Three.js Visualizer Setup ---
let scene, camera, renderer, controls, building;
const container = document.getElementById('three-container');

function initVisualizer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Floor/Grid
    const grid = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
    scene.add(grid);

    // Initial building
    updateBuilding(10, 20, 10);

    animate();
}

function updateBuilding(h, d, w, results = null) {
    if (building) scene.remove(building);

    const roofType = document.getElementById('roof_type').value;
    const angleDeg = parseFloat(document.getElementById('roof_angle').value);
    const angleRad = angleDeg * (Math.PI / 180);

    let geometry;
    if (roofType === 'monopitch') {
        const shape = new THREE.Shape();
        shape.moveTo(-w/2, 0);
        shape.lineTo(w/2, 0);
        shape.lineTo(w/2, h);
        shape.lineTo(-w/2, h + Math.tan(angleRad) * w); // monopitch rise
        shape.closePath();
        
        const extrudeSettings = { depth: d, bevelEnabled: false };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateY(Math.PI/2);
        geometry.translate(0, 0, d/2);
    } else if (roofType === 'duopitch') {
        const shape = new THREE.Shape();
        shape.moveTo(-w/2, 0);
        shape.lineTo(w/2, 0);
        shape.lineTo(w/2, h);
        shape.lineTo(0, h + Math.tan(angleRad) * (w/2)); // peak
        shape.lineTo(-w/2, h);
        shape.closePath();

        const extrudeSettings = { depth: d, bevelEnabled: false };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateY(Math.PI/2);
        geometry.translate(0, 0, d/2);
    } else {
        geometry = new THREE.BoxGeometry(w, h, d);
        geometry.translate(0, h/2, 0);
    }

    // Materials
    // Order: +x, -x, +y, -y, +z, -z
    // We'll use: +z = Windward (D), -z = Leeward (E), +y = Roof
    const colors = {
        side: 0x94a3b8,    // default gray
        windward: 0xef4444, // red
        leeward: 0x3b82f6,  // blue
        roof: 0xf59e0b      // amber
    };

    const materials = [
        new THREE.MeshPhongMaterial({ color: colors.side }),     // +x
        new THREE.MeshPhongMaterial({ color: colors.side }),     // -x
        new THREE.MeshPhongMaterial({ color: colors.roof }),     // +y
        new THREE.MeshPhongMaterial({ color: colors.side }),     // -y
        new THREE.MeshPhongMaterial({ color: colors.windward }), // +z (Windward D)
        new THREE.MeshPhongMaterial({ color: colors.leeward })   // -z (Leeward E)
    ];

    building = new THREE.Mesh(geometry, materials);
    scene.add(building);

    // Wind direction arrow
    if (scene.getObjectByName('windArrow')) scene.remove(scene.getObjectByName('windArrow'));
    const dir = new THREE.Vector3(0, 0, 1);
    const origin = new THREE.Vector3(0, h/2, -d/2 - 5);
    const arrowHelper = new THREE.ArrowHelper(dir, origin, 10, 0x34d399, 2, 1);
    arrowHelper.name = 'windArrow';
    scene.add(arrowHelper);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize on load
initVisualizer();

// --- Project Management Setup ---
const projectsList = document.getElementById('projects-list');
const saveBtn = document.getElementById('save-btn');
const refreshBtn = document.getElementById('refresh-projects-btn');

async function loadProjects() {
    try {
        const response = await fetch('/projects');
        const projects = await response.json();
        
        if (projects.length === 0) {
            projectsList.innerHTML = '<div class="empty-state">No saved projects yet.</div>';
            return;
        }

        projectsList.innerHTML = '';
        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.innerHTML = `
                <div class="project-info" onclick="loadProjectData(${project.id})">
                    <span class="project-name">${project.name}</span>
                    <span class="project-date">${new Date(project.timestamp).toLocaleString()}</span>
                </div>
                <div class="project-actions">
                    <button class="btn-delete-project" onclick="deleteProject(event, ${project.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            projectsList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function saveProject() {
    const projectName = prompt("Enter a name for this project:", `Project ${new Date().toLocaleDateString()}`);
    if (!projectName) return;

    const h_raw = parseFloat(document.getElementById('h').value);
    const d_raw = parseFloat(document.getElementById('d').value);
    const vb0_raw = parseFloat(document.getElementById('vb0').value);
    const z_raw = parseFloat(document.getElementById('z').value);
    const rho_raw = parseFloat(document.getElementById('rho').value);

    // Normalize to SI
    const h   = currentSystem === 'imperial' ? h_raw   / CONV.m_to_ft      : h_raw;
    const d   = currentSystem === 'imperial' ? d_raw   / CONV.m_to_ft      : d_raw;
    const vb0 = currentSystem === 'imperial' ? vb0_raw / CONV.ms_to_mph    : vb0_raw;
    const z   = currentSystem === 'imperial' ? z_raw   / CONV.m_to_ft      : z_raw;
    const rho = currentSystem === 'imperial' ? rho_raw / CONV.kgm3_to_lbft3 : rho_raw;

    const formData = {
        vb0, terrain_cat: document.getElementById('terrain_cat').value,
        h, d, z, rho,
        cpi: parseFloat(document.getElementById('cpi').value),
        roof_type: document.getElementById('roof_type').value,
        roof_angle: parseFloat(document.getElementById('roof_angle').value)
    };

    try {
        const response = await fetch(`/projects?name=${encodeURIComponent(projectName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadProjects();
            alert('Project saved successfully!');
        }
    } catch (error) {
        alert('Error saving project');
    }
}

async function deleteProject(event, id) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/projects/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadProjects();
        }
    } catch (error) {
        alert('Error deleting project');
    }
}

async function loadProjectData(id) {
    try {
        const response = await fetch(`/projects/${id}`);
        const project = await response.json();
        const inputs = project.inputs;

        document.getElementById('vb0').value = inputs.vb0;
        document.getElementById('terrain_cat').value = inputs.terrain_cat;
        document.getElementById('h').value = inputs.h;
        document.getElementById('d').value = inputs.d;
        document.getElementById('z').value = inputs.z;
        document.getElementById('rho').value = inputs.rho;
        document.getElementById('cpi').value = inputs.cpi;
        document.getElementById('roof_type').value = inputs.roof_type || 'flat';
        document.getElementById('roof_angle').value = inputs.roof_angle || 0;

// Auto calculate
        document.getElementById('calc-btn').click();
    } catch (error) {
        alert('Error loading project data');
    }
}

// Expose globally
window.loadProjectData = loadProjectData;
window.deleteProject = deleteProject;

saveBtn.addEventListener('click', saveProject);
refreshBtn.addEventListener('click', loadProjects);

// Initial load
loadProjects();

// --- Form Handling ---
document.getElementById('calc-btn').addEventListener('click', async () => {
    const btnText = document.getElementById('calc-btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const resultsCard = document.getElementById('results-card');
    const resultsEmpty = document.getElementById('results-empty');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    const h_raw = parseFloat(document.getElementById('h').value) || 10;
    const d_raw = parseFloat(document.getElementById('d').value) || 20;
    const w_raw = parseFloat(document.getElementById('w').value) || 20;
    const vb0_raw = parseFloat(document.getElementById('vb0').value) || 25;
    const z_raw = parseFloat(document.getElementById('z').value) || 10;
    const rho_raw = parseFloat(document.getElementById('rho').value) || 1.25;

    // Normalize to SI for backend
    const h   = currentSystem === 'imperial' ? h_raw   / CONV.m_to_ft      : h_raw;
    const d   = currentSystem === 'imperial' ? d_raw   / CONV.m_to_ft      : d_raw;
    const w   = currentSystem === 'imperial' ? w_raw   / CONV.m_to_ft      : w_raw;
    const vb0 = currentSystem === 'imperial' ? vb0_raw / CONV.ms_to_mph    : vb0_raw;
    const z   = currentSystem === 'imperial' ? z_raw   / CONV.m_to_ft      : z_raw;
    const rho = currentSystem === 'imperial' ? rho_raw / CONV.kgm3_to_lbft3 : rho_raw;

    const formData = {
        vb0, terrain_cat: document.getElementById('terrain_cat').value,
        h, d, z, rho,
        cpi: parseFloat(document.getElementById('cpi').value),
        roof_type: document.getElementById('roof_type').value,
        roof_angle: parseFloat(document.getElementById('roof_angle').value)
    };

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to calculate');
        }

        const data = await response.json();

        // Update 3D Model
        updateBuilding(h, d, w, data);

        // Convert factors
        const u    = UNITS[currentSystem];
        const pFac = currentSystem === 'imperial' ? CONV.pa_to_psf * 1000 : 1;
        const sFac = currentSystem === 'imperial' ? CONV.ms_to_mph : 1;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

        // KPIs & Key Results
        const qp = data.qp_kpa;
        const wnetd = data.wnet_d_kpa;
        const wnete = data.wnet_e_kpa;
        const roofSuctions = [data.we_f/1000, data.we_g/1000, data.we_h/1000, data.we_i/1000];
        const maxSuction = Math.min(wnete, ...roofSuctions);
        const maxPressure = Math.max(wnetd, 0); // Usually D is the only pressure zone
        const resultantForce = data.total_net_kpa * h * w; // kN

        set('res-qp',  (qp * pFac).toFixed(2));
        set('res-max-suction', (maxSuction * pFac).toFixed(2));
        set('res-max-pressure', (maxPressure * pFac).toFixed(2));
        set('res-force', resultantForce.toFixed(0)); // force usually doesn't need scaling if imperial is lbf, but let's keep it simple. Actually let's handle imperial force if needed.
        
        const fFac = currentSystem === 'imperial' ? CONV.pa_to_psf * Math.pow(CONV.m_to_ft, 2) * 1000 : 1; // Wait, 1 kN = 224.8 lbf. For simplicity we'll just show kN if metric, kips if imperial.
        // If imperial: force in kips = force in kN * 0.224809
        const force_disp = currentSystem === 'imperial' ? resultantForce * 0.224809 : resultantForce;
        set('res-force', force_disp.toFixed(1));

        set('res-qp-unit',  u.press);
        set('res-max-suction-unit',  u.press);
        set('res-max-pressure-unit', u.press);
        set('res-force-unit', currentSystem === 'imperial' ? 'kips' : 'kN');

        // Wall coeffs & pressures
        set('res-cped',  data.cpe_d.toFixed(2));
        set('res-cpee',  data.cpe_e.toFixed(2));
        set('res-wnetd', `${(data.wnet_d_kpa * pFac).toFixed(3)} ${u.press}`);
        set('res-wnete', `${(data.wnet_e_kpa * pFac).toFixed(3)} ${u.press}`);

        // Roof
        set('res-wef', `${((data.we_f/1000) * pFac).toFixed(3)} ${u.press}`);
        set('res-weg', `${((data.we_g/1000) * pFac).toFixed(3)} ${u.press}`);
        set('res-weh', `${((data.we_h/1000) * pFac).toFixed(3)} ${u.press}`);
        set('res-wei', `${((data.we_i/1000) * pFac).toFixed(3)} ${u.press}`);

        set('res-terrain-desc', data.terrain_description);
        set('res-terrain-badge', `Cat. ${formData.terrain_cat}`);

        // Update Trace
        set('tr-vb', (vb0 * sFac).toFixed(1));
        set('tr-cr', data.cr.toFixed(3));
        set('tr-vm', (data.vm * sFac).toFixed(1));
        set('tr-iv', data.iv.toFixed(3));
        set('tr-qp', (qp * pFac).toFixed(3));
        document.querySelector('#tr-vb').nextElementSibling.textContent = u.speed;
        document.querySelector('#tr-vm').nextElementSibling.textContent = u.speed;
        document.querySelector('#tr-qp').nextElementSibling.textContent = u.press;

        // Draw Chart
        drawChart(data, pFac, u.press);

        // Update Legend values
        document.getElementById('legend-max-press').textContent = '+' + maxPressure.toFixed(1);
        document.getElementById('legend-max-suct').textContent = maxSuction.toFixed(1);
        document.getElementById('legend-unit-lbl').textContent = u.press;
        document.getElementById('color-legend').style.display = 'flex';

        // Add Text Sprites to 3D
        addTextSprites(w, h, d, data);

        // Show results, hide empty state
        if (resultsEmpty) resultsEmpty.style.display = 'none';
        resultsCard.classList.remove('results-hidden');

        resultsCard.offsetHeight; /* trigger reflow */
        resultsCard.style.animation = 'slideUp 0.5s ease backwards';

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        // Hide loading state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});

document.getElementById('pdf-btn').addEventListener('click', async () => {
    const btnText = document.getElementById('pdf-btn-text');
    const btnLoader = document.getElementById('pdf-loader');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    const h_raw = parseFloat(document.getElementById('h').value);
    const d_raw = parseFloat(document.getElementById('d').value);
    const vb0_raw = parseFloat(document.getElementById('vb0').value);
    const z_raw = parseFloat(document.getElementById('z').value);
    const rho_raw = parseFloat(document.getElementById('rho').value);

    // Normalize to SI
    const h   = currentSystem === 'imperial' ? h_raw   / CONV.m_to_ft      : h_raw;
    const d   = currentSystem === 'imperial' ? d_raw   / CONV.m_to_ft      : d_raw;
    const vb0 = currentSystem === 'imperial' ? vb0_raw / CONV.ms_to_mph    : vb0_raw;
    const z   = currentSystem === 'imperial' ? z_raw   / CONV.m_to_ft      : z_raw;
    const rho = currentSystem === 'imperial' ? rho_raw / CONV.kgm3_to_lbft3 : rho_raw;

    const formData = {
        vb0, terrain_cat: document.getElementById('terrain_cat').value,
        h, d, z, rho,
        cpi: parseFloat(document.getElementById('cpi').value),
        roof_type: document.getElementById('roof_type').value,
        roof_angle: parseFloat(document.getElementById('roof_angle').value)
    };

    try {
        const response = await fetch('/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wind_report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        // Hide loading state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});

document.getElementById('excel-btn').addEventListener('click', async () => {
    const btnText = document.getElementById('excel-btn-text');
    const btnLoader = document.getElementById('excel-loader');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    const h_raw = parseFloat(document.getElementById('h').value);
    const d_raw = parseFloat(document.getElementById('d').value);
    const vb0_raw = parseFloat(document.getElementById('vb0').value);
    const z_raw = parseFloat(document.getElementById('z').value);
    const rho_raw = parseFloat(document.getElementById('rho').value);

    // Normalize to SI
    const h   = currentSystem === 'imperial' ? h_raw   / CONV.m_to_ft      : h_raw;
    const d   = currentSystem === 'imperial' ? d_raw   / CONV.m_to_ft      : d_raw;
    const vb0 = currentSystem === 'imperial' ? vb0_raw / CONV.ms_to_mph    : vb0_raw;
    const z   = currentSystem === 'imperial' ? z_raw   / CONV.m_to_ft      : z_raw;
    const rho = currentSystem === 'imperial' ? rho_raw / CONV.kgm3_to_lbft3 : rho_raw;

    const formData = {
        vb0, terrain_cat: document.getElementById('terrain_cat').value,
        h, d, z, rho,
        cpi: parseFloat(document.getElementById('cpi').value),
        roof_type: document.getElementById('roof_type').value,
        roof_angle: parseFloat(document.getElementById('roof_angle').value)
    };

    try {
        const response = await fetch('/export-excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to generate Excel');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wind_loads.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        // Hide loading state
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});

// --- Calculation Trace Toggle ---
document.getElementById('trace-toggle-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const content = document.getElementById('trace-content');
    btn.classList.toggle('open');
    content.classList.toggle('open');
});

// --- Chart.js Rendering ---
let pressureChart = null;

function drawChart(data, pFac, unit) {
    const ctx = document.getElementById('pressureChart').getContext('2d');
    
    const labels = ['D (Windward)', 'E (Leeward)', 'F (Corner)', 'G (Edge)', 'H (Interior)', 'I (Center)'];
    const values = [
        data.wnet_d_kpa * pFac,
        data.wnet_e_kpa * pFac,
        (data.we_f/1000) * pFac,
        (data.we_g/1000) * pFac,
        (data.we_h/1000) * pFac,
        (data.we_i/1000) * pFac
    ];

    const backgroundColors = values.map(v => v > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)');
    const borderColors = values.map(v => v > 0 ? '#ef4444' : '#3b82f6');

    if (pressureChart) {
        pressureChart.destroy();
    }

    pressureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Net Pressure (${unit})`,
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.parsed.y.toFixed(2)} ${unit}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: {family: "'JetBrains Mono', monospace"} }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: {size: 10} }
                }
            }
        }
    });
}

// --- Three.js Text Sprites ---
const sprites = [];

function makeSprite(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add small background glow
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 1);
    return sprite;
}

function addTextSprites(w, h, d, data) {
    // Remove old sprites
    sprites.forEach(s => scene.remove(s));
    sprites.length = 0;

    // +z Windward D
    const spriteD = makeSprite(`Cpe: +${data.cpe_d.toFixed(2)}`, '#fca5a5');
    spriteD.position.set(0, h/2, d/2 + 0.5);
    scene.add(spriteD);
    sprites.push(spriteD);

    // -z Leeward E
    const spriteE = makeSprite(`Cpe: ${data.cpe_e.toFixed(2)}`, '#93c5fd');
    spriteE.position.set(0, h/2, -d/2 - 0.5);
    scene.add(spriteE);
    sprites.push(spriteE);

    // Roof Top
    const spriteRoof = makeSprite('Zones F-I', '#fcd34d');
    spriteRoof.position.set(0, h + 2, 0);
    scene.add(spriteRoof);
    sprites.push(spriteRoof);
}

// --- Real-time Interaction ---
// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const autoCalc = debounce(() => {
    // Only auto-calc if results aren't hidden (i.e. user already did initial compute)
    if (!document.getElementById('results-card').classList.contains('results-hidden')) {
        document.getElementById('calc-btn').click();
    }
}, 500);

// Attach to inputs
const inputsToWatch = ['vb0', 'terrain_cat', 'h', 'd', 'w', 'z', 'rho', 'cpi', 'roof_type', 'roof_angle'];
inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', autoCalc);
        el.addEventListener('change', autoCalc);
    }
});
