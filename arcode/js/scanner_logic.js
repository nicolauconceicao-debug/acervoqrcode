// Aguarda o HTML carregar completamente
document.addEventListener("DOMContentLoaded", () => {
    let currentHD = null;
    let html5QrCode;

    try {
        // Inicializa o leitor na div "reader"
        html5QrCode = new Html5Qrcode("reader");
    } catch (e) {
        console.error("Erro ao inicializar Html5Qrcode:", e);
        return;
    }

    // Configurações ideais e simplificadas para evitar quebras no celular
    const config = { 
        fps: 10, // 10 FPS é ideal para celulares mais antigos não travarem
        qrbox: { width: 250, height: 250 }, 
        aspectRatio: 1.777778
    };

    // Tenta aplicar o filtro de QR Code se a biblioteca suportar globalmente
    if (typeof Html5QrcodeSupportedFormats !== 'undefined') {
        config.formatsToSupport = [ Html5QrcodeSupportedFormats.QR_CODE ];
    }

    // Callback de sucesso na leitura
    const onScanSuccess = (decodedText) => {
        const idLimpo = decodedText.trim().toUpperCase();
        
        // Impede leituras duplicadas seguidas
        if (currentHD === idLimpo) return;
        currentHD = idLimpo;

        // Pausa o scanner para economizar memória e congelar o frame
        if (html5QrCode && html5QrCode.getState() === 2) { // 2 significa SCANNING
            html5QrCode.pause(true);
        }
    
        // Liga a borda amarela na tela
        const reticulo = document.getElementById('reticulo-foco');
        if (reticulo) reticulo.classList.add('detected');
    
        abrirPainel(idLimpo);
        if (navigator.vibrate) navigator.vibrate(60);
    };

    // Inicia a câmera traseira de forma segura
    function ligarCamera() {
        html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            onScanSuccess
        ).catch(err => {
            console.error("Não foi possível iniciar a câmera:", err);
            const statusMsg = document.querySelector('.status-msg');
            if (statusMsg) statusMsg.innerText = "Erro: Recarregue a página e permita a câmera.";
        });
    }

    // Executa a inicialização da câmera
    ligarCamera();

    // Função interna para gerenciar o painel e buscar metadados
    function abrirPainel(id) {
        const sheet = document.getElementById('info-sheet');
        document.getElementById('hd-id-tag').innerText = "ID: " + id;
        
        document.getElementById('hd-title').innerText = "Carregando...";
        document.getElementById('val-projeto').innerText = "...";

        // Busca dados no seu JSON estruturado
        fetch(`base_dados_json/${id}/${id.toLowerCase()}_step3.json`)
            .then(res => {
                if (!res.ok) throw new Error("Arquivo não encontrado");
                return res.json();
            })
            .then(data => {
                const projetoNome = Object.keys(data)[0];
                
                document.getElementById('hd-title').innerText = projetoNome;
                document.getElementById('val-projeto').innerText = projetoNome.length > 22 ? projetoNome.substring(0, 22) + "..." : projetoNome;
                
                sheet.classList.add('active');
            })
            .catch(err => {
                console.warn("Erro ao buscar JSON para o ID:", id, err);
                document.getElementById('hd-title').innerText = "Acervo não mapeado";
                document.getElementById('val-projeto').innerText = "Indisponível";
                sheet.classList.add('active');
            });

        // Ação do Botão Ver Mapa
        document.getElementById('go-to-map').onclick = () => {
            window.location.href = `mapas_hd/${id}.html`; 
        };

        // Gerenciamento da Cesta de Memórias
        document.getElementById('add-to-basket').onclick = () => {
            let cesta = JSON.parse(localStorage.getItem('cesta_pesquisa')) || [];
            
            if (!cesta.includes(id)) {
                cesta.push(id);
                localStorage.setItem('cesta_pesquisa', JSON.stringify(cesta));
                alert(`HD ${id} salvo na sua cesta de pesquisa!`);
            } else {
                alert("Este acervo já está na sua cesta.");
            }
        };
    }
    
    // Gerencia o fechamento do painel (Botão X)
    document.getElementById('close-btn').onclick = () => {
        document.getElementById('info-sheet').classList.remove('active');
        document.getElementById('reticulo-foco').classList.remove('detected');
        
        currentHD = null;

        // Acorda o scanner de volta se ele estiver pausado
        if (html5QrCode && html5QrCode.getState() === 3) { // 3 significa PAUSED
            html5QrCode.resume();
        }
    };
});
