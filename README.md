# citar_ilustracao — citar figura/tabela no texto

Plugin do **CKEditor 4** que insere no texto uma **menção a uma ilustração do
próprio documento** ("conforme a Figura 2"), de forma que o número impresso no
PDF seja sempre o correto — inclusive depois de o autor inserir outra figura
antes dela.

Feito para o Sistema de TCC da UNA-SUS/UFSC, seguindo a ABNT (NBR 14724).

> ⚠️ **Este plugin não funciona sozinho.** Ele é a ponta de um fluxo que envolve
> a aplicação hospedeira: um endpoint que lista as ilustrações, uma rotina que
> renumera as menções ao salvar e um conversor para LaTeX. O contrato está
> descrito em [O que a aplicação precisa oferecer](#o-que-a-aplicação-precisa-oferecer).

## O problema que ele resolve

Numerar ilustração à mão não sobrevive à edição: basta inserir uma figura no
meio do texto para toda a numeração seguinte ficar errada — e as menções
("ver Figura 3") passam a apontar para a figura errada, **em silêncio**. É o
tipo de defeito que só aparece na banca.

Aqui a menção guarda o **identificador** da ilustração, nunca o número. Quem
resolve o número é o LaTeX, no momento da impressão.

## Como funciona

```
[ diálogo ]  →  <refilustracao data-alvo="fig-7a3c">Figura 2</refilustracao>
                             │                        │
                             │                        └── só para o editor mostrar
                             └── a verdade: vira \ref{fig-7a3c} no PDF
```

1. O diálogo busca a lista de ilustrações citáveis no endpoint da aplicação.
2. Ao confirmar, insere a tag `<refilustracao>` no ponto do cursor, com o
   `data-alvo` apontando para o identificador da ilustração.
3. Na geração do PDF, a tag vira `\ref{...}`, que o LaTeX resolve a partir do
   `\label{...}` emitido pela figura ou tabela.

## Três decisões que não são óbvias

**O texto visível é descartável.** O que está dentro da tag serve só para o
editor mostrar algo legível; ele deve ser **regenerado no servidor** a cada
salvamento e a cada abertura da tela. Sem isso, inserir uma figura antes
deixaria a menção com o número velho, e o autor leria no editor um número
diferente do que o PDF imprime. O `\ref` sempre acerta; o editor é que precisa
acompanhar.

**Tag própria, nunca `<span>`.** No sistema de origem, a rotina de limpeza do
conteúdo apaga todo `<span>` e todo `<div>` ao salvar (lixo de formatação que o
editor produz). Uma menção em `<span>` sumiria do texto do autor no primeiro
salvamento, sem aviso. Por ser desconhecida, `<refilustracao>` é tratada como
elemento **inline**: vive dentro do `<p>` sem quebrar o HTML, ao contrário de
`<div>`/`<figure>`, que fariam o navegador reestruturar o parágrafo.

**No texto entra só o número.** O rótulo completo ("Figura 2 – Fluxograma")
serve para *escolher* no diálogo; repetido no texto corrido seria ruído.

## Estados tratados

| Situação | Comportamento |
|---|---|
| Ilustração ainda não salva | Não aparece na lista. O diálogo explica que é preciso salvar — é no salvamento que ela ganha o identificador. |
| Nenhuma ilustração citável | O diálogo explica o que fazer, em vez de mostrar um seletor vazio. |
| Figura citada foi apagada | A menção fica com texto vazio (o servidor não inventa número) e o CSS mostra "⚠ figura citada não existe mais". |

## Instalação

```
config.extraPlugins = 'citar_ilustracao';
```

O botão entra no grupo `editing` da barra de ferramentas, com o rótulo
**"Citar figura/tabela"**.

> ⚠️ O rótulo **não** é "Inserir referência": em trabalhos acadêmicos
> "Referências" é a bibliografia, e o autor entenderia outra coisa.

## O que a aplicação precisa oferecer

**1. Endpoint `ilustracoes.json`** (relativo à página do editor), devolvendo a
lista **na ordem do documento**:

```json
[ { "ref": "fig-7a3c", "rotulo": "Figura 2 – Fluxograma", "tipo": "figura" },
  { "ref": "tab-91bd", "rotulo": "Tabela 1 – População",  "tipo": "tabela" } ]
```

O `rotulo` vai pronto porque é pela legenda que o autor reconhece a figura
dele. Ilustração sem legenda ainda é citável, identificada só pelo número.

**2. Renumeração das menções no servidor**, ao salvar e ao abrir a tela:
reescrever o texto interno de cada `<refilustracao>` a partir do `data-alvo`.
Alvo que não existe mais deve resultar em texto **vazio**, nunca no número
velho.

**3. Conversão para LaTeX**, emitindo `\ref{}` a partir do `data-alvo` — e
**não** imprimindo o texto interno, que sairia duplicado. Sem `data-alvo`, não
emitir nada: um `\ref{}` vazio faz o LaTeX imprimir "??" no meio do texto.

**4. `\label{}` nas ilustrações**, com o mesmo identificador usado no
`data-alvo`. É ele que fecha o ciclo.

## Arquivos

| Arquivo | Papel |
|---|---|
| `plugin.js` | botão, comando e CSS da menção |
| `dialogs/citar_ilustracao.js` | lista as ilustrações e insere a menção |
| `icons/citar_ilustracao.png` | ícone do botão |

## Licença

Mesma licença do Sistema de TCC da UNA-SUS/UFSC.
