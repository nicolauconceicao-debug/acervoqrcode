let currentHD = null;

// Inicializa o Scanner
const scanner = new Html5QrcodeScanner("reader", { fps: 20, qrbox: 250 });

scanner.render((decodedText) => {
    // decodedText deve ser o ID do HD, ex: "hd_0001"
    if (currentHD !== decodedText) {
        currentHD = decodedText;
        abrirPainel(decodedText);
    }
});

function abrirPainel(id) {
    const sheet = document.getElementById('info-sheet');
    document.getElementById('hd-id-tag').innerText = "ID: " + id.toUpperCase();

    // Busca dados no seu JSON
    fetch(`base_dados/${id}/${id}_step3.json`)
        .then(res => res.json())
        .then(data => {
            const projetoNome = Object.keys(data)[0];
            document.getElementById('hd-title').innerText = projetoNome;
            document.getElementById('val-projeto').innerText = projetoNome.substring(0, 20) + "...";
            sheet.classList.add('active');
        });

    // Botão Ver Mapa
    document.getElementById('go-to-map').onclick = () => {
        window.location.href = `Mapas_HTML/${id}.html`;
    };

    // Lógica da Cesta (Cesta de Memórias)
    document.getElementById('add-to-basket').onclick = () => {
        let cesta = JSON.parse(localStorage.getItem('cesta_pesquisa')) || [];
        if (!cesta.includes(id)) {
            cesta.push(id);
            localStorage.setItem('cesta_pesquisa', JSON.stringify(cesta));
            alert("HD Salvo na sua cesta de pesquisa!");
        }
    };
}

// Fechar Painel
document.getElementById('close-btn').onclick = () => {
    document.getElementById('info-sheet').classList.remove('active');
    currentHD = null;
};
