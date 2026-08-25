// Citar figura/tabela no texto (#19, T11).
//
// ⚠️ O rotulo do botao e' "Citar figura/tabela", NAO "Inserir referencia": no
// TCC "Referencias" e' a bibliografia, e o aluno entenderia outra coisa.
//
// Espelha o plugin `citacao` (mesmo formato de plugin.js + dialogs/), que e' o
// precedente da casa para elemento proprio inserido no texto.
CKEDITOR.plugins.add('citar_ilustracao', {
    icons: 'citar_ilustracao',
    requires: 'dialog',

    onLoad: function() {
        // Mesma marcacao visual do `citacao`: quem le' o texto precisa
        // distinguir a mencao do texto corrido, e ela nao e' editavel a mao (o
        // numero vem do servidor).
        CKEDITOR.addCss('refilustracao' +
            '{' +
            'background-color: #eaf2fd;' +
            'border-bottom: 1px dotted #767676;' +
            ( CKEDITOR.env.gecko ? 'cursor: default;' : '' ) +
            '}' +
            // Mencao cujo alvo sumiu (a figura citada foi apagada): fica
            // VAZIA, porque o servidor nao inventa numero. Sem um aviso aqui
            // ela viraria um buraco invisivel no meio da frase. Ambar, nunca
            // vermelho -- em protanopia o vermelho some contra o cinza.
            'refilustracao:empty::before' +
            '{' +
            'content: "\\26A0 figura citada n\\00E3o existe mais";' +
            'color: #8A5A00;' +
            'font-style: italic;' +
            'font-size: 0.85em;' +
            '}'
        );
    },

    init: function(editor) {
        editor.addCommand('inserirCitacaoIlustracao', new CKEDITOR.dialogCommand('inserirCitacaoIlustracao'));

        editor.ui.addButton('CitarIlustracao', {
            label: 'Citar figura/tabela',
            command: 'inserirCitacaoIlustracao',
            toolbar: 'editing',
            // ⚠️ `icon` EXPLICITO. Sem ele o CKEditor procura o icone pelo nome
            // do BOTAO em minusculas ("citarilustracao"), que nao bate com o
            // nome registrado em `icons` ("citar_ilustracao", com sublinhado) --
            // e o botao sai SEM IMAGEM, em silencio. Medido: o
            // `background-image` do span do icone vinha `none`.
            //
            // No plugin `citacao` isso passa despercebido porque "Citacao" ->
            // "citacao" coincide com o nome do arquivo.
            icon: 'citar_ilustracao'
        });

        CKEDITOR.dialog.add('inserirCitacaoIlustracao', this.path + 'dialogs/citar_ilustracao.js');
    }
});

CKEDITOR.plugins.citar_ilustracao = {
    // Insere a mencao no ponto do cursor.
    //
    // ⚠️ O texto visivel entra aqui so' para o aluno ver o resultado NA HORA --
    // a verdade e' o `data-alvo`. O servidor reescreve esse texto a cada save e
    // a cada abertura da tela (HTMLProcessor#renumera_mencoes), porque inserir
    // uma figura ANTES muda o numero de todas as seguintes. E no PDF quem manda
    // e' o `\ref`, resolvido pelo proprio LaTeX.
    inserir: function(editor, ref, rotulo) {
        // ⚠️ EDITAR substitui; nunca insere dentro. Relatado em tela: inserir uma
        // citacao e depois tentar troca-la por outra figura produzia
        // "FigurFigura 2a 1" -- a mencao nova entrava DENTRO da antiga, partindo
        // o texto dela ao meio. O `insertElement` poe no ponto do cursor, e o
        // cursor estava dentro da mencao que se queria editar.
        var existente = CKEDITOR.plugins.citar_ilustracao.selecionada(editor);

        if (existente) {
            existente.setAttribute('data-alvo', ref);
            existente.setText(rotulo);
            return;
        }

        var mencao = editor.document.createElement('refilustracao');

        mencao.setAttributes({
            contentEditable: 'false',
            'data-alvo': ref
        });
        mencao.setText(rotulo);

        editor.insertElement(mencao);
    },

    // A mencao sob o cursor (ou selecionada), se houver. Mesmo padrao do
    // `getSelectedCitation` do plugin `citacao`.
    selecionada: function(editor) {
        var selecao = editor.getSelection();
        if (!selecao) { return null; }

        var elemento = selecao.getSelectedElement();
        if (elemento && elemento.getName() === 'refilustracao') { return elemento; }

        var faixa = selecao.getRanges()[0];
        if (!faixa) { return null; }

        var no = faixa.startContainer;
        while (no && !(no.type === CKEDITOR.NODE_ELEMENT && no.getName() === 'refilustracao')) {
            no = no.getParent();
        }

        return no;
    }
};
