// Aguarda o HTML carregar completamente para evitar erros de elementos nulos
document.addEventListener("DOMContentLoaded", () => {
    let currentHD = null;
    let html5QrCode = new Html5Qrcode("reader");

    // Configurações ideais para escaneamento móvel rápido
    const config = { 
        fps: 15, 
        qrbox: { width: 250, height: 250 }, 
        aspectRatio: 1.777778, // <-- VÍRGULA CORRIGIDA AQUI
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] // Foca SÓ em QR Code
    };

    // Callback de sucesso na leitura
    const onScanSuccess = (decodedText) => {
        const idLimpo = decodedText.trim().toUpperCase();
        
        // Impede leituras duplas instantâneas do mesmo código
        if (currentHD === idLimpo) return;
        currentHD = idLimpo;

        // PAUSA O SCANNER imediatamente para economizar bateria e memória
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.pause(true); // 'true' congela o último frame do vídeo na tela
        }
    
        // Liga a borda amarela na tela
        const reticulo = document.getElementById('reticulo-foco');
        if (reticulo) reticulo.classList.add('detected');
    
        abrirPainel(idLimpo);
        if (navigator.vibrate) navigator.vibrate(60);
    };

    // Inicia a câmera traseira do celular
    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(err => {
        console.error("Não foi possível iniciar a câmera:", err);
        document.querySelector('.status-msg').innerText = "Erro: Permita o acesso à câmera.";
    });

    // Função interna para gerenciar o painel e buscar metadados
    function abrirPainel(id) {
        const sheet = document.getElementById('info-sheet');
        document.getElementById('hd-id-tag').innerText = "ID: " + id;
        
        // Reseta os textos para o estado de carregamento
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
                
                // Exibe as informações recuperadas
                document.getElementById('hd-title').innerText = projetoNome;
                document.getElementById('val-projeto').innerText = projetoNome.length > 22 ? projetoNome.substring(0, 22) + "..." : projetoNome;
                
                // Abre o card
                sheet.classList.add('active');
            })
            .catch(err => {
                console.warn("Erro ao buscar JSON para o ID:", id, err);
                document.getElementById('hd-title').innerText = "Acervo não mapeado";
                document.getElementById('val-projeto').innerText = "Indisponível";
                sheet.classList.add('active');
            });

        // Ação do Botão Ver Mapa (Mantido como você ajustou: mapas_hd)
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
        
        // Limpa o HD para permitir ler o mesmo código logo em seguida, se quiser
        currentHD = null;

        // ACORDA O SCANNER de volta instantaneamente
        if (html5QrCode.getState() === Html5QrcodeScannerState.PAUSED) {
            html5QrCode.resume();
        }
    };
});
