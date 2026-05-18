// Aguarda o HTML carregar completamente para evitar erros de elementos nulos
document.addEventListener("DOMContentLoaded", () => {
    let currentHD = null;
    let html5QrCode;

    // Inicializa a classe de baixo nível (não gera botões nativos nem textos feios)
    html5QrCode = new Html5Qrcode("reader");

    // Configurações ideais para escaneamento móvel rápido
    const config = { 
        fps: 20, 
        qrbox: { width: 250, height: 250 }, // Tamanho alinhado com a sua mira CSS
        aspectRatio: 1.777778 // Força a proporção 16:9 de tela cheia mobile
    };

    // Callback disparado quando um código é lido com sucesso
    const onScanSuccess = (decodedText) => {
        // Trata o texto decodificado (limpa espaços e força minúsculo se necessário)
        const idLimpo = decodedText.trim().toLowerCase();

        if (currentHD !== idLimpo) {
            currentHD = idLimpo;
            abrirPainel(idLimpo);
            
            // Pequeno feedback de vibração no celular para avisar que leu
            if (navigator.vibrate) navigator.vibrate(60);
        }
    };

    // Inicia a câmera traseira do celular automaticamente
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
        document.getElementById('hd-id-tag').innerText = "ID: " + id.toUpperCase();
        
        // Reseta os textos para o estado de carregamento caso o fetch demore
        document.getElementById('hd-title').innerText = "Carregando...";
        document.getElementById('val-projeto').innerText = "...";

        // Busca dados no seu JSON estruturado
        fetch(`base_dados/${id}/${id}_step3.json`)
            .then(res => {
                if (!res.ok) throw new Error("Arquivo não encontrado");
                return res.json();
            })
            .then(data => {
                const projetoNome = Object.keys(data)[0];
                
                // Exibe as informações recuperadas
                document.getElementById('hd-title').innerText = projetoNome;
                document.getElementById('val-projeto').innerText = projetoNome.length > 22 ? projetoNome.substring(0, 22) + "..." : projetoNome;
                
                // Exibe a folha de informações subindo suavemente
                sheet.classList.add('active');
            })
            .catch(err => {
                console.warn("Erro ao buscar JSON para o ID:", id, err);
                document.getElementById('hd-title').innerText = "Acervo não mapeado";
                document.getElementById('val-projeto').innerText = "Indisponível";
                sheet.classList.add('active');
            });

        // Configura dinamicamente a ação do Botão Ver Mapa
        document.getElementById('go-to-map').onclick = () => {
            window.location.href = `Mapas_HTML/${id}.html`;
        };

        // Gerenciamento da Cesta de Memórias (Pesquisa) via localStorage
        document.getElementById('add-to-basket').onclick = () => {
            let cesta = JSON.parse(localStorage.getItem('cesta_pesquisa')) || [];
            
            if (!cesta.includes(id)) {
                cesta.push(id);
                localStorage.setItem('cesta_pesquisa', JSON.stringify(cesta));
                alert(`HD ${id.toUpperCase()} salvo na sua cesta de pesquisa!`);
            } else {
                alert("Este acervo já está na sua cesta.");
            }
        };
    }

    // Gerencia o fechamento do painel (Botão X)
    document.getElementById('close-btn').onclick = () => {
        document.getElementById('info-sheet').classList.remove('active');
        // Libera a variável para que o mesmo HD possa ser escaneado novamente em sequência
        setTimeout(() => { currentHD = null; }, 1000); 
    };
});
