// Diálogo "Citar figura/tabela" (#19, T11).
//
// Lista as ilustrações do TCC pelo rótulo que o aluno reconhece
// ("Figura 2 – Fluxograma") e insere a menção no ponto do cursor.
(function() {
    function carregaIlustracoes() {
        var lista = [];

        // `async: false` como no diálogo de citação: o CKEditor monta a
        // definição do diálogo de forma síncrona, e a lista precisa estar
        // pronta antes de o select existir.
        $.ajax({
            dataType: 'json',
            url: '../ilustracoes.json',
            async: false,
            success: function(dados) { lista = dados; }
        });

        return lista;
    }

    CKEDITOR.dialog.add('inserirCitacaoIlustracao', function(editor) {
        var ilustracoes = carregaIlustracoes();

        // [rótulo visível, valor] -- o valor é o `data-ref`, que vira `\label`
        // no PDF e é o que o `\ref` resolve.
        var itens = ilustracoes.map(function(i) { return [i.rotulo, i.ref]; });

        var vazio = itens.length === 0;

        return {
            title: 'Citar figura/tabela',
            minWidth: 450,
            minHeight: 120,
            contents: [{
                id: 'principal',
                label: 'Citar figura/tabela',
                elements: vazio ? [{
                    // ⚠️ Diálogo vazio precisa DIZER o que falta e o que fazer.
                    // Sem legenda ou fonte a ilustração continua citável -- o
                    // que impede de citar é ela ainda não ter sido salva, que é
                    // quando ganha o identificador (T4).
                    type: 'html',
                    html: '<p>Nenhuma figura ou tabela para citar ainda.</p>' +
                          '<p style="color:#8A5A00">Insira a ilustração e <strong>salve o texto</strong>: ' +
                          'é ao salvar que ela ganha o identificador usado na citação.</p>'
                }] : [{
                    type: 'select',
                    id: 'ilustracao',
                    label: 'Qual ilustração citar?',
                    items: itens,
                    'default': itens[0][1]
                }]
            }],
            // Editando uma menção existente: o diálogo abre já apontando para
            // a ilustração citada hoje. Sem isso o aluno escolhe às cegas -- não
            // vê de qual figura está saindo.
            onShow: function() {
                if (vazio) { return; }

                var existente = CKEDITOR.plugins.citar_ilustracao.selecionada(editor);
                if (!existente) { return; }

                var alvo = existente.getAttribute('data-alvo');
                var conhecida = ilustracoes.some(function(i) { return i.ref === alvo; });
                if (conhecida) {
                    this.getContentElement('principal', 'ilustracao').setValue(alvo);
                }
            },

            onOk: function() {
                if (vazio) { return; }

                var ref = this.getContentElement('principal', 'ilustracao').getValue();
                var escolhida = ilustracoes.filter(function(i) { return i.ref === ref; })[0];
                if (!escolhida) { return; }

                // Só o NÚMERO entra no texto ("conforme a Figura 2"), não a
                // legenda inteira: o rótulo do diálogo serve para ESCOLHER;
                // no texto corrido a legenda repetida seria ruído.
                var numero = escolhida.rotulo.split(' – ')[0];

                CKEDITOR.plugins.citar_ilustracao.inserir(editor, ref, numero);
            }
        };
    });
})();
