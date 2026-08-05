# Adamante

Implementação web do protótipo **Adamante** — RPG cujo personagem evolui com esforço real
(treino, estudo, trabalho), conforme o *Documento de Design e Especificação Técnica v1.0*
e o documento de design `Adamante.dc.html` (projeto Claude Design *Adamante RPG prototype*).

Treze telas jogáveis, sem dependência nenhuma: HTML, CSS e JavaScript puro.

## Como rodar

Qualquer servidor estático a partir desta pasta (os módulos são carregados por `<script src>`,
então `file://` não serve por causa do CORS das fontes e do `localStorage`):

```bash
python -m http.server 8099
# depois: http://127.0.0.1:8099/index.html
```

- `index.html` — a página de apresentação, com os dois aparelhos (iPhone 402×874 e Android 412×892).
  Cada moldura roda uma sessão independente do app, em `<iframe>`.
- `app.html` — o app sozinho, em tela cheia. É este arquivo que se empacota num WebView.

### Parâmetros de URL do `app.html`

| Parâmetro | Valores | Padrão |
|---|---|---|
| `platform` | `ios`, `android` | `ios` |
| `start` | `splash`, `login`, `cadastro`, `onboarding`, `inicio`, `ficha`, `medicao`, `deck`, `batalha`, `guilda`, `thread`, `ranking`, `perfil` | `splash` |
| `name` | nome do personagem | vazio |
| `battleMode` | `confronto`, `livre` | `confronto` |
| `returning` | `1` para usuário que voltou (começa com Fadiga 5) | desligado |
| `guild` | `empty` para abrir a guilda no estado vazio (convite por link e primeira meta) | guilda cheia |

`platform` muda o respiro do topo (ilha dinâmica do iOS × barra de status do Android),
o rótulo do botão social e a altura da barra de abas.

## Instalar no aparelho

Os dois pacotes saem do mesmo código. `node build-www.js` monta `www/`, que é ao mesmo
tempo o PWA e o conteúdo que vai dentro do APK — não existe uma segunda base para manter.

### Android · APK

```bash
npm install
npm run apk:debug     # android/app/build/outputs/apk/debug/app-debug.apk
```

Instalação direta, fora da Play Store: o Android vai pedir autorização para instalar de
fontes desconhecidas. O app roda 100% offline, sem conta e sem servidor.

Para um APK assinado de release, crie a chave e o `android/keystore.properties` (nenhum dos
dois entra no git):

```bash
keytool -genkey -v -keystore ../keystores/adamante.keystore \
  -alias adamante -keyalg RSA -keysize 2048 -validity 10000
printf 'storeFile=../../keystores/adamante.keystore\nstorePassword=SUA_SENHA\nkeyAlias=adamante\nkeyPassword=SUA_SENHA\n' > android/keystore.properties
npm run apk:release
```

### iPhone · PWA

Publique `www/` em qualquer host estático com HTTPS (service worker exige HTTPS, com exceção
de `localhost`). No iPhone: abra a URL no Safari, toque em Partilhar e escolha *Adicionar à
Tela de Início*. A partir daí o app abre em tela cheia, com ícone próprio, e funciona sem
internet depois da primeira abertura.

Para conferir localmente antes de publicar:

```bash
npm run build
node serve.js www 8100     # http://127.0.0.1:8100/
```

Não há projeto iOS nativo: o GDD prevê React Native para o produto, e para o protótipo o PWA
entrega a mesma tela cheia sem precisar de Mac, Xcode e conta de desenvolvedor.

## Estrutura

```
index.html            apresentação + molduras de aparelho (é também a página do GitHub Pages)
app.html              o app
build-www.js          monta www/ — o PWA e o conteúdo do APK
serve.js              servidor estático de desenvolvimento
capacitor.config.json empacotamento Android
css/adamante.css      keyframes e base (portados 1:1 do documento de design)
js/runtime.js         renderizador mínimo: estilos, escape, hover e morph de DOM
js/data.js            dados de jogo (classes, atributos, cartas, guilda, trocas)
js/core.js            camada de regras — funções puras
js/state.js           estado e ações
js/vals.js            estilos, rótulos e handlers derivados do estado
js/views.js           as telas
js/app.js             bootstrap: props da URL, eventos delegados, animação de íris
assets/               emblema (.webp usado pelo app, .png é o mestre dos ícones)
fonts/                Bebas Neue e Karla self-hosted, para funcionar offline
icons/                ícones de PWA, Android e iOS
resources/            entradas do @capacitor/assets
android/              projeto Capacitor
www/                  pacote gerado — não edite à mão
design/               fonte original exportada do Claude Design, para conferência
docs/gdd.md           o documento de design e especificação técnica
```

### `js/core.js` é a camada `/core` da especificação

A seção 21.1 do GDD exige que as regras sejam funções puras, sem React, sem banco e sem tela,
compartilháveis entre cliente e servidor. `core.js` é isso: modificador de atributo, base
normalizada, custo progressivo de ponto, curva de XP, efeito da Fadiga, PV, Defesa, dano,
crítico, teste de resistência e conversão de bioimpedância. Nenhuma delas toca no DOM.

Quando este protótipo virar produto, é este arquivo que migra para o servidor — o GDD é
explícito: cálculo que gera XP, ouro ou carta não roda no cliente.

### Por que um "morph" em vez de trocar `innerHTML`

O documento de design roda sobre o runtime do Claude Design (`x-dc`, `sc-if`, `sc-for`,
`DCLogic`), que é reativo à la React. Aqui as telas são funções que devolvem HTML, e
`runtime.js` costura o HTML novo dentro do DOM existente, atributo por atributo. Se
trocasse `innerHTML` a cada `setState`, toda animação CSS em curso — `admDrift`, `admRing2`,
`admSheen`, o carrossel 3D de classes — reiniciaria do zero e a tela piscaria.

Pelo mesmo motivo o `:hover` virou classe CSS gerada em tempo de execução
(`runtime.js → hoverClass`): estilo inline venceria uma regra `:hover` comum, então cada
declaração entra com `!important` numa folha própria.

## Regras que o desenho carrega

- **Nada regride.** Fadiga enfraquece o atributo só no cálculo de combate; o valor real
  continua inteiro na ficha, e o número enfraquecido aparece em violeta, nunca em vermelho.
  Derrota mostra "0 perdido".
- **Gordura corporal** aparece uma vez, sem adjetivo, na Medição — e em nenhum ranking,
  perfil ou tela pública. O interruptor correspondente no Perfil é travado por design.
- **Autodeclarado rende 70%** e não conta para o ranking global (`core.xpValidado`).
- **Cartas de ataque sempre acertam**; a Defesa reduz o dano. A aleatoriedade fica só no
  crítico (19-20, ou 17-20 no Ladino), onde só pode surpreender para melhor.
- **Custo progressivo:** acima de 15 o ponto custa 2; acima de 18, custa 3.

## Diferenças em relação ao documento de design

1. **`<image-slot>`** — o canvas do Claude Design usa um componente próprio para a foto de
   comprovação. Aqui virou um slot nativo: toque para escolher ou arraste uma imagem; a foto
   fica no `localStorage` e sobrevive ao recarregar.
2. **Correção de um bug latente** — sair do combate durante a revelação da carta (no modo
   Confronto Simultâneo) ressuscitava uma batalha sem mão, e a tela quebrava. O `setState`
   adiado agora desiste se a batalha já não existe (`state.js → commitCard`).
3. **Regras centralizadas** — o documento repetia as fórmulas dentro da lógica de tela; aqui
   elas moram só em `core.js`, como a especificação manda.
4. **Relógio do cronômetro acelerado** — o cronômetro de estudo (validação de camada 2) roda a
   mecânica real: dois blocos de foco, pausa entre eles e detecção de app em segundo plano, que
   invalida o bloco em curso (`app.js → visibilitychange`). Só o relógio é comprimido para caber
   numa demonstração; o app real conta 25 minutos por bloco. A tela avisa isso.

## O que já entrega, além do laço básico

- **Cronômetro de estudo** (§18.2) — pomodoro de dois blocos com detecção de segundo plano.
  Toque na missão de estudo para abrir; sair do app durante o foco zera o bloco.
- **Missão épica** (§11.4) — criação com prazo de 15 a 90 dias, barra de progresso, conclusão
  (800–2.000 XP conforme o prazo, +500 ouro, +3 pontos) e vencimento sem punição, recriável.
- **Estado vazio de guilda** (§15) — convite por link e definição da primeira meta coletiva.
  Abra com `app.html?guild=empty` ou pelo atalho "ver guilda de exemplo".
- **Descanso Sagrado** (§12.3) — toque no indicador de Fadiga, na tela Início, para marcar
  até 4 folgas planejadas no mês, com a trava de 12 h de antecedência. Nos dias marcados não
  há Fadiga e a sequência é preservada.
- **Reforja de cartas** (§17) — na tela Deck, 5 cópias repetidas da mesma carta viram 1 de
  raridade superior, gastando ouro. O custo sobe com a raridade; a barra mostra o progresso
  até as 5 cópias, e cartas épicas não têm nível acima.
- **Arte de classe, monstro e carta** — os espaços antes tracejados agora têm arte real, com
  tiles de pixel art do Dungeon Crawl Stone Soup (CC0). Ficam em `assets/art/`, referenciados
  por `id` (`cls_<classe>`, `card_<id>`, `mon_sentinela`) e renderizados com `image-rendering`
  pixelado (classe `.adm-art`). As cartas também têm ícone na mão de batalha e nos dois lados
  do duelo do Confronto.
- **Dados e privacidade · LGPD** (§19) — na aba Perfil, "Exportar todos os meus dados" baixa
  um JSON de verdade com o que é seu (personagem, atributos, missões, equipamento, aparências),
  e "Excluir conta" apaga tudo do aparelho (limpa o `localStorage`) atrás de uma confirmação.
- **Fonte de validação automática** (§18.1) — cartão de Health Connect (Android) / Apple Saúde
  (iOS) no Perfil, com conectar/desconectar. Conectado, é a camada de confiança mais alta:
  passos, treinos, frequência e sono validando missões sem foto.
- **Equipamento** (§8.2/§17) — na Ficha, três peças (bracelete, elmo, talismã) compradas com
  ouro. O bônus entra de verdade: soma na Defesa (que reduz o dano no combate, via
  `core.defesa`) e o talismã amplia a chance de crítico (limiar do d20 −1). Equipar/desequipar
  à vontade; comprar é permanente e reseta ao recomeçar o personagem.
- **Seletor de aparência com desbloqueio** — cada classe tem quatro personagens (variações de
  gênero e raça: guerreira, goblin, feiticeira, etc.). Só a primeira vem grátis; as outras
  desbloqueiam com **ouro** (250 e 600) ou **concluindo uma missão épica** (`data.js →
  LOOK_UNLOCK`). A raça é permanente: **trocar de aparência exige recomeçar o personagem do
  zero** — os desbloqueios já conquistados permanecem. Escolha no onboarding, gestão na aba
  Perfil. Estado em `state.portraits`/`unlockedLooks`, persistido no `localStorage`.

## Licença de conteúdo

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of
the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the
Creative Commons Attribution 4.0 International License, available at
https://creativecommons.org/licenses/by/4.0/legalcode.

A arte de personagens, monstros e itens usa tiles do **Dungeon Crawl Stone Soup**, em sua
maioria sob **Creative Commons Zero (CC0, domínio público)** — veja https://github.com/crawl/tiles.
Nenhum material de terceiros protegido e nenhuma arte de D&D entram no app, como o GDD exige.

As duas atribuições também aparecem na tela Perfil do app, em fonte legível, como o GDD exige.
