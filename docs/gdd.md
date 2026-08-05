# Documento de Design e Especificação Técnica
## Aplicativo de RPG com progressão baseada em hábitos reais

**Versão do documento:** 1.0
**Data:** agosto de 2026
**Status:** especificação para desenvolvimento da versão 1

---

# Parte I — Fundamentos

## 1. Visão do produto

Um aplicativo mobile que converte esforço real — treino de academia, estudo e trabalho — em progressão de personagem de RPG, com batalhas de cartas contra monstros e contra outros jogadores.

**Promessa central:** o usuário não treina para ganhar pontos abstratos. Ele treina porque o esforço real vira poder concreto dentro do jogo, e porque a inatividade tem consequência visível.

**Diferencial em relação aos concorrentes:** aplicativos de hábito existentes (Habitica, Finch, Level Up Life) usam gamificação decorativa — o personagem é um enfeite ao lado da lista de tarefas. Aqui a composição corporal medida por bioimpedância alimenta diretamente os atributos, e os atributos determinam o resultado de batalhas disputadas contra pessoas reais. O jogo tem consequência competitiva.

## 2. Público-alvo

**Primário:** 18 a 30 anos, já frequenta academia ou estuda para provas e concursos, tem dificuldade de manter constância sozinho, tem familiaridade com jogos.

**Secundário:** grupos de amigos que treinam juntos e buscam competição saudável entre si.

**Explicitamente fora do escopo:** menores de 18 anos no módulo de composição corporal (ver seção 20).

## 3. Pilares de design

Toda decisão de produto deve ser checada contra estes quatro pilares. Se uma funcionalidade violar um deles, ela não entra.

1. **O esforço real precisa ser sentido em até 72 horas.** Progressão lenta demais mata a motivação antes que o hábito se forme.
2. **Nunca punir com perda permanente.** A consequência da falha é temporária e o caminho de volta é curto. Perda irreversível é a principal causa de abandono.
3. **Premiar comportamento, nunca aparência.** A pontuação vem do que a pessoa fez, não de como o corpo dela é.
4. **Quem está começando sobe mais rápido.** A progressão é calculada sobre a melhora relativa de cada um, não sobre valores absolutos.

## 4. Base de regras e licenciamento

O sistema é **derivado do SRD 5.2**, publicado pela Wizards of the Coast sob licença Creative Commons Attribution 4.0 International.

**O que é aproveitado do SRD:**
- Os seis atributos e seus nomes
- A fórmula de modificador de atributo
- O conceito de vantagem e desvantagem
- Testes de resistência
- Faixa de valores 1 a 20 e progressão de 20 níveis

**O que é original deste projeto e não vem do SRD:**
- Toda a curva de experiência
- O cálculo de pontos de vida e dano
- O sistema de energia e cartas
- O sistema de Fadiga
- A conversão de bioimpedância em atributos
- Nomes de classes, cartas, monstros e habilidades

**Atribuição obrigatória.** O texto abaixo deve aparecer na tela "Sobre" do aplicativo, em fonte legível:

> This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Nenhuma outra menção à Wizards of the Coast é permitida. É permitido afirmar compatibilidade com "quinta edição"; é proibido sugerir parceria, patrocínio ou aprovação.

**Proibições absolutas no conteúdo:** não usar nomes próprios de criaturas, magias, itens, lugares ou personagens dos livros de D&D que estejam fora do SRD. Não usar arte de terceiros. Não usar o PDF de tradução de fãs de qualquer edição.

---

# Parte II — Sistema de personagem

## 5. Atributos

Seis atributos, escala de 1 a 20.

| Atributo | Sigla | Alimentado por |
|---|---|---|
| Força | FOR | Massa muscular medida por bioimpedância |
| Constituição | CON | Água corporal e massa magra relativa à altura |
| Destreza | DES | Treinos de cardio, mobilidade e alongamento |
| Inteligência | INT | Horas de estudo validadas |
| Sabedoria | SAB | Constância: sequência de dias sem falha |
| Carisma | CAR | Batalhas disputadas, convites aceitos, atividade de guilda |

### 5.1 Modificador de atributo

```
modificador = floor((valor_do_atributo - 10) / 2)
```

| Valor | 1 | 2-3 | 4-5 | 6-7 | 8-9 | 10-11 | 12-13 | 14-15 | 16-17 | 18-19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Modificador | -5 | -4 | -3 | -2 | -1 | 0 | +1 | +2 | +3 | +4 | +5 |

Esta é a fórmula mais usada de todo o sistema. Deve ser implementada como função pura, testada, e nunca duplicada em outro ponto do código.

### 5.2 Composição do valor do atributo

```
valor_do_atributo = base_normalizada + pontos_alocados
```

Limite máximo de 20. Limite mínimo de 1.

**`base_normalizada`** — calculada uma única vez, na criação do personagem, entre **6 e 10**. Nunca recalculada para baixo.

**`pontos_alocados`** — pontos que o usuário distribui manualmente conforme os obtém.

### 5.3 A regra mais importante do sistema

**O atributo nunca é derivado do valor absoluto de uma medição.**

Se Força fosse calculada diretamente da massa muscular em quilos, um usuário de 95 kg começaria com Força 18 e uma usuária de 52 kg começaria com Força 6. A segunda desinstalaria o aplicativo na primeira semana, e ela é exatamente a pessoa que mais precisa de motivação.

A base normalizada usa **percentil dentro da faixa esperada para o próprio perfil** (sexo, idade e altura). Dois usuários de portes completamente diferentes, ambos medianos para o próprio perfil, começam com o mesmo valor.

```
percentil = posição do usuário na distribuição de referência do seu perfil  (0.0 a 1.0)
base_normalizada = 6 + round(percentil × 4)
```

Faixas de referência devem ser tabeladas por sexo biológico, faixa etária (18-24, 25-34, 35-44, 45+) e faixa de altura, usando dados públicos de composição corporal. Onde não houver dado confiável, usar base 8 (mediana) e registrar como estimativa.

Toda a diferenciação real entre jogadores vem dos `pontos_alocados`, ou seja, do que a pessoa **fez** depois de instalar o aplicativo. Isso é intencional e é o que torna o jogo justo.

### 5.4 Origem dos pontos alocáveis

| Fonte | Quantidade | Frequência |
|---|---|---|
| Subir de nível | 2 pontos | A cada nível |
| Nova medição de bioimpedância com evolução | 1 a 5 pontos | Máximo a cada 7 dias |
| Conclusão de missão épica | 3 pontos | Variável |
| Marcos de sequência (30, 60, 90, 180, 365 dias) | 5 pontos | Marco único |

Pontos são **livres**: o usuário decide onde aplicar. Um jogador pode escolher despejar tudo em Inteligência mesmo tendo ganho os pontos na academia. Essa liberdade é deliberada — ela permite construções de personagem diferentes e evita que o sistema pareça uma planilha de bioimpedância disfarçada.

**Custo progressivo:** elevar um atributo acima de 15 custa 2 pontos por incremento; acima de 18, custa 3 pontos. Isso evita personagens com um atributo em 20 e o resto em 6.

## 6. Bioimpedância

### 6.1 Dados coletados

Registro manual, a partir de balança de bioimpedância doméstica ou de avaliação profissional:

- Peso (kg)
- Massa muscular esquelética (kg)
- Massa magra total (kg)
- Percentual de gordura corporal
- Percentual de água corporal
- Taxa metabólica basal (kcal)
- Data da medição

Apenas peso e massa muscular são obrigatórios. Os demais são opcionais e refinam o cálculo quando presentes.

### 6.2 Frequência

Intervalo mínimo de **7 dias** entre medições. Tentativas antes disso são bloqueadas com mensagem explicando que a composição corporal não muda de forma mensurável em menos de uma semana e que medições muito frequentes captam apenas variação de hidratação.

### 6.3 Conversão em pontos

A pontuação vem do **delta em relação à medição anterior do próprio usuário**, nunca do valor absoluto.

```
pontos = min(5, floor(Δmassa_magra_kg / 0.4) + bônus_hidratação)

onde:
  Δmassa_magra_kg  = massa magra atual − massa magra da medição anterior
  bônus_hidratação = 1 se o percentual de água subiu ao menos 1 ponto, senão 0
```

Se `Δmassa_magra` for negativo, **o resultado é zero pontos — nunca negativo**. O usuário não perde nada por ter uma medição pior. Perda de progresso conquistado viola o pilar 2.

O teto de 5 pontos por medição existe para impedir manipulação por desidratação, jejum ou medições em condições diferentes.

### 6.4 Exibição

- Gráfico de evolução pessoal ao longo do tempo, **visível apenas para o próprio usuário**.
- Percentual de gordura corporal **nunca** aparece em ranking, comparação, perfil público ou tela compartilhável.
- Nenhum texto do aplicativo qualifica um valor como bom, ruim, alto ou baixo. O aplicativo mostra apenas a direção da mudança em relação à medição anterior.

## 7. Classes

Escolhidas na criação do personagem, irreversíveis até o primeiro reset de temporada.

| Classe | Atributo primário | Passiva | Estilo de deck |
|---|---|---|---|
| Guerreiro | FOR | +15% de PV máximo | Dano direto, cartas de custo baixo |
| Ladino | DES | +10% de chance de crítico | Velocidade, esquiva, dano acumulado |
| Mago | INT | +1 de energia máxima | Efeitos, controle, dano em área |
| Clérigo | SAB | Cura 5% do PV máximo por turno | Sustentação, resistência, buffs |

O **atributo primário** é o que determina o dano das cartas de ataque da classe. É por isso que a escolha de classe define quais missões o jogador vai priorizar — um Mago tem incentivo forte para estudar.

## 8. Pontos de vida, defesa e dano

### 8.1 Pontos de vida

```
PV_máximo = 40 + (nível × 6) + (modificador_CON × 5) + bônus_de_classe
```

Exemplos: Guerreiro nível 1 com CON 14 (mod +2) → 40 + 6 + 10 + 15% = 64 PV. Mago nível 20 com CON 18 (mod +4) → 40 + 120 + 20 = 180 PV.

### 8.2 Defesa

```
Defesa = 10 + modificador_DES + bônus_de_equipamento
```

### 8.3 Dano — sem rolagem de acerto

Esta é a divergência mais importante em relação ao SRD, e é deliberada.

No RPG de mesa, o ataque exige rolar 1d20 contra a Defesa. Isso significa que um personagem forte erra o golpe com frequência. Numa mesa, isso vira história divertida. Num aplicativo de hábito, isso é o usuário treinando por três semanas, perdendo a batalha por azar, e concluindo que o esforço não importou. Aleatoriedade alta destrói a percepção de causalidade entre esforço e resultado, que é o produto inteiro.

Portanto: **cartas de ataque sempre acertam.** A defesa reduz o dano em vez de anulá-lo.

```
dano_final = max(1, dano_base_da_carta + (modificador_primário × 2) − mitigação)

mitigação = floor(Defesa_do_alvo / 3)
```

O `max(1, ...)` garante que nenhuma batalha trave em impasse.

### 8.4 Crítico

A aleatoriedade fica confinada aqui, onde ela é positiva (surpresa boa) e nunca negativa.

Ao jogar uma carta de ataque, rola-se 1d20. Resultado **19 ou 20** é crítico: dano final multiplicado por 2.

O Ladino tem chance ampliada (17 a 20). Cartas e equipamentos podem conceder **vantagem** na rolagem de crítico — rolar dois d20 e usar o melhor. Desvantagem (usar o pior) existe para efeitos de inimigos.

Vantagem e desvantagem nunca se acumulam: uma fonte de cada já basta, e as duas juntas se cancelam.

## 9. Testes de resistência

Usados fora do combate, em eventos narrativos e em efeitos de cartas.

```
resultado = 1d20 + modificador_do_atributo + bônus_de_proficiência
sucesso se resultado ≥ Classe de Dificuldade
```

**Bônus de proficiência por nível:** +2 (níveis 1-4), +3 (5-8), +4 (9-12), +5 (13-16), +6 (17-20).

**Classes de dificuldade padrão:** 10 (fácil), 15 (médio), 20 (difícil), 25 (muito difícil).

---

# Parte III — Progressão

## 10. Experiência e níveis

Vinte níveis. A curva é **muito mais acelerada que a de RPG de mesa**, porque o ciclo de reforço aqui é diário, não semanal.

```
XP para subir do nível n para o nível n+1 = round(80 × n^1.5, dezena mais próxima)
```

| Nível | XP para o próximo | Nível | XP para o próximo |
|---|---|---|---|
| 1 | 80 | 11 | 2.920 |
| 2 | 230 | 12 | 3.330 |
| 3 | 420 | 13 | 3.750 |
| 4 | 640 | 14 | 4.190 |
| 5 | 890 | 15 | 4.650 |
| 6 | 1.180 | 16 | 5.120 |
| 7 | 1.480 | 17 | 5.610 |
| 8 | 1.810 | 18 | 6.110 |
| 9 | 2.160 | 19 | 6.620 |
| 10 | 2.530 | 20 | — (máximo) |

**Ritmo esperado:** um usuário ativo ganha entre 100 e 150 XP por dia. Chega ao nível 2 no primeiro dia, ao nível 5 na primeira semana, ao nível 10 em cerca de dois meses e ao nível 20 em aproximadamente 12 a 14 meses de uso consistente.

O nível 1 é curto de propósito: o usuário precisa subir de nível na primeira sessão, antes de fechar o aplicativo pela primeira vez.

## 11. Missões

### 11.1 Categorias

- **Corpo** — academia, cardio, mobilidade, sono
- **Mente** — estudo, leitura, cursos
- **Ofício** — trabalho, projetos, tarefas profissionais

### 11.2 Frequências e recompensas

| Tipo | Quantidade | XP | Ouro | Chance de carta |
|---|---|---|---|---|
| Diária fácil | 2 por dia | 15 | 10 | 15% |
| Diária média | 2 por dia | 25 | 20 | 30% |
| Diária difícil | 1 por dia | 40 | 35 | 50% |
| Semanal | 3 por semana | 150 a 300 | 100 | 100% |
| Épica | definida pelo usuário | 800 a 2.000 | 500 | 100% + 3 pontos de atributo |

### 11.3 Geração de missões diárias

Geradas automaticamente às 4h da manhã no fuso do usuário, com base na rotina cadastrada no onboarding (dias de treino, disponibilidade de estudo, jornada de trabalho).

Regras de geração:
- Ao menos uma missão de cada categoria por dia, quando a rotina permitir.
- A dificuldade escala com o nível: uma missão "difícil" no nível 3 e no nível 15 não pedem a mesma coisa.
- Dias marcados como descanso na rotina geram apenas missões de Mente e Ofício.
- Nunca gerar missão de treino em dia consecutivo para o mesmo grupo muscular.

### 11.4 Missões épicas

Definidas pelo próprio usuário, com prazo entre 15 e 90 dias. Exemplos: "estudar 60 horas em 30 dias", "completar 40 treinos em 60 dias".

O aplicativo acompanha o progresso parcial e exibe uma barra. Se o prazo vencer sem conclusão, **não há penalidade** — a missão simplesmente expira e o usuário pode recriá-la. Falhar em algo ambicioso não pode ser punido, ou ninguém tenta nada ambicioso.

## 12. Fadiga

O sistema de consequência por inatividade. Substitui a perda de XP.

### 12.1 Por que não remover XP

Remoção de progresso conquistado é a principal causa documentada de abandono em aplicativos de hábito. O padrão é sempre o mesmo: o usuário se ausenta uma semana por doença, viagem ou uma fase ruim; volta ao aplicativo; vê que regrediu três níveis; conclui que não vale a pena recomeçar; desinstala.

A Fadiga preserva o progresso e ainda assim cria urgência, porque enfraquece o personagem no presente.

### 12.2 Mecânica

| Pontos de Fadiga | Efeito |
|---|---|
| 0 | Nenhum |
| 1 a 2 | Sequência zerada; aviso visual na tela inicial |
| 3 a 5 | Atributos reduzidos em 20%; cartas raras e épicas bloqueadas |
| 6 ou mais | Atributos reduzidos em 40%; PvP bloqueado |

**Acúmulo:** cada missão diária não concluída até o fim do dia gera 1 ponto de Fadiga, limitado a 3 pontos por dia.

**Recuperação:** cada dia com todas as missões diárias concluídas remove 2 pontos.

**Teto:** a Fadiga nunca passa de 9 pontos. Um usuário ausente por dois meses volta ao estado pleno em no máximo 5 dias — não em dois meses.

A redução de atributos é aplicada apenas para efeito de cálculo de combate. O valor real permanece intacto no banco e continua visível na ficha, marcado como enfraquecido. O usuário precisa enxergar que não perdeu nada.

### 12.3 Descanso Sagrado

Até **4 dias por mês** podem ser marcados como folga planejada, com no mínimo 12 horas de antecedência. Nesses dias não há geração de Fadiga e a sequência é preservada.

Isso cobre doença, viagem, luto e descanso legítimo. A antecedência exigida impede que seja usado como desculpa retroativa.

Aplicativos que punem descanso ensinam o usuário a treinar doente. Isso é dano real e não é aceitável.

---

# Parte IV — Cartas e combate

## 13. Cartas

### 13.1 Origem

Cartas não são compradas com dinheiro real e não são sorteadas sem contexto. São **fabricadas pela ação real concluída**:

| Ação real | Tipo de carta gerada |
|---|---|
| Treino de força | Ataque |
| Cardio ou mobilidade | Velocidade, esquiva, dano acumulado |
| Sessão de estudo validada | Efeito, controle, dano em área |
| Meta de trabalho concluída | Ouro e recursos para equipamento |
| Sono registrado dentro da meta | Cura e recuperação |

Este é o vínculo mais importante do produto: a pessoa não treina para ganhar um número, ela treina para ganhar uma carta específica que ela quer no deck.

### 13.2 Raridade

| Raridade | Chance base | Custo de energia | Poder relativo |
|---|---|---|---|
| Comum | 60% | 1 a 2 | Referência |
| Incomum | 25% | 2 a 3 | +40% |
| Rara | 12% | 3 a 5 | +90% |
| Épica | 3% | 5 a 6 | +160% |

**Modificador de sequência:** cada 7 dias consecutivos de sequência aumenta em 2 pontos percentuais a chance de raridade alta, com teto de +10. Recompensa constância sem exigir gasto.

**Modificador de dificuldade:** missões difíceis e semanais deslocam a distribuição para cima.

### 13.3 Anatomia de uma carta

```
{
  nome, descrição, arte,
  tipo: ataque | defesa | efeito | cura | recurso,
  raridade, custo_energia,
  dano_base, cura_base,
  atributo_escalonamento: FOR | DES | INT | SAB | CAR | nenhum,
  efeitos: [ { tipo, magnitude, duração } ],
  classe_restrita: opcional
}
```

## 14. Combate

### 14.1 Estrutura

- Deck de exatamente **20 cartas**, máximo de 2 cópias da mesma carta.
- Mão inicial de **5 cartas**. Compra 1 carta no início de cada turno.
- Energia inicial: 3. Aumenta 1 por turno, teto de 10 (11 para o Mago).
- Mão máxima de 8 cartas; excedente é descartado no fim do turno.
- Quando o deck acaba, a pilha de descarte é embaralhada e vira o novo deck; cada vez que isso acontece o personagem sofre 5 de dano por exaustão. Isso impede batalhas infinitas.

### 14.2 Fluxo de turno

1. Compra 1 carta
2. Ganha energia
3. Efeitos ativos são resolvidos (veneno, cura por turno, escudos)
4. Jogador joga quantas cartas a energia permitir
5. Fim do turno: descarta excedente, efeitos temporários decrementam

### 14.3 Modos

**PvE** — capítulos com monstros de dificuldade escalonada. Cada capítulo tem 10 encontros e um chefe. O monstro é determinístico: mesmo nível, mesmo comportamento, permitindo que o jogador aprenda o padrão.

**PvP assíncrono** — o jogador desafia um amigo ou alguém do ranking. O oponente joga o turno dele quando abrir o aplicativo. Prazo de 24 horas por turno; se estourar, o turno é jogado automaticamente pela inteligência artificial simples do sistema.

**PvP não entra na versão 1.** Combate em tempo real não entra em nenhuma versão prevista — o custo técnico é várias vezes maior e não é isso que retém o usuário.

### 14.4 Recompensas de combate

Vitória em PvE concede XP e ouro. Vitória em PvP concede pontos de ranking e Carisma.

**Derrota não tira nada.** Perde-se apenas o tempo da partida.

---

# Parte V — Social e economia

## 15. Guildas

- Até 10 membros.
- Membros veem as missões concluídas uns dos outros no dia.
- Qualquer membro pode **contestar** uma conclusão suspeita. Três contestações invalidam a missão e devolvem as recompensas.
- Metas coletivas semanais concedem recompensa a todos os membros.

O constrangimento social é o mecanismo antifraude mais eficaz que existe, e custa muito menos que qualquer verificação técnica.

## 16. Ranking

Três rankings separados: amigos, guilda e global. Temporadas de 90 dias, com reset de posição (nunca de nível ou atributos) e recompensas cosméticas para o topo.

**Nenhum dado de composição corporal aparece em qualquer ranking.** Rankings exibem nível, sequência, missões concluídas e vitórias.

## 17. Economia

Moeda única: **ouro**, obtido apenas por missões e combate. Não existe compra de ouro com dinheiro real na versão 1.

Gasto em: equipamento (bônus de Defesa e escalonamento), reforja de cartas (transforma 5 cartas repetidas em 1 de raridade superior), cosméticos.

Monetização futura, se houver, deve ser exclusivamente cosmética ou de conveniência que não afete o balanceamento competitivo. Vender poder num aplicativo cujo diferencial é "esforço real vira poder" destruiria o produto.

## 18. Validação antifraude

Sem isso o jogo vira mentira coletiva em duas semanas. Três camadas:

1. **Automática** — Health Connect (Android) e HealthKit (iOS): passos, treinos, frequência cardíaca, sono. Confiabilidade alta.
2. **Cronômetro interno** — estudo e trabalho contam apenas com o timer rodando no aplicativo, modelo pomodoro, com detecção de aplicativo em segundo plano. Confiabilidade média.
3. **Social** — validação por guilda, descrita acima. Confiabilidade alta na prática.

Toda conclusão de missão grava no banco a **origem da validação**. Missões validadas apenas por autodeclaração recebem 70% do XP e não contam para ranking global.

---

# Parte VI — Segurança, privacidade e responsabilidade

## 19. Dados sensíveis e LGPD

Dados de composição corporal e saúde são **dados pessoais sensíveis** pela Lei Geral de Proteção de Dados. Requisitos obrigatórios:

- Consentimento explícito, específico e destacado antes de qualquer coleta de dado de saúde. Consentimento genérico nos termos de uso não é suficiente.
- Row Level Security ativada em todas as tabelas com dado pessoal. O usuário só acessa as próprias linhas.
- Criptografia em repouso e em trânsito.
- Exportação e exclusão total de dados a pedido do usuário, executadas em até 15 dias.
- Nenhum dado de saúde compartilhado com terceiros ou usado em publicidade.
- Registro de log de acesso a dados sensíveis.

## 20. Responsabilidade em saúde mental

Este aplicativo mede corpos e distribui pontos. Feito sem cuidado, ele vira uma ferramenta de gatilho para transtorno alimentar e exercício compulsivo. As regras abaixo não são opcionais.

- **Percentual de gordura nunca é pontuado, nunca é comparado, nunca é público.** Ele aparece apenas no histórico privado do usuário, como número neutro.
- **Nenhuma penalidade é aplicada por peso, gordura ou aparência.** Toda penalidade vem exclusivamente de comportamento (não fez a missão).
- **Nenhum texto do aplicativo qualifica um corpo.** Não existem palavras como "ótimo", "ideal", "acima do ideal", "precisa melhorar" aplicadas a medidas corporais.
- **Teto de treino.** O aplicativo não concede recompensa adicional acima de 2 sessões de treino por dia nem acima de 6 dias por semana. Excesso não pontua.
- **Descanso obrigatório.** Ao detectar 7 dias consecutivos de treino, o aplicativo sugere descanso e concede o Descanso Sagrado automaticamente, sem custo.
- **Menores de 18 anos:** o módulo de composição corporal é integralmente desativado. A base normalizada fica fixa em 8 para todos os atributos físicos, e a progressão vem apenas de missões.
- **Detecção de padrão de risco:** perda de peso superior a 5% em 30 dias, ou registro de treino acima do teto por mais de duas semanas, dispara uma mensagem de cuidado com orientação para buscar profissional de saúde, e suspende temporariamente o módulo de composição corporal.

---

# Parte VII — Especificação técnica

## 21. Arquitetura

**Frontend:** React Native com Expo, TypeScript. Aplicativo único para Android e iOS.
**Backend:** Supabase — PostgreSQL, autenticação, realtime, storage, Row Level Security.
**Lógica de jogo:** camada isolada em TypeScript puro, compartilhada entre cliente e servidor.
**Estado:** Zustand.
**Persistência offline:** AsyncStorage com fila de sincronização.
**Testes:** Jest sobre a camada de regras.

### 21.1 Separação obrigatória

A camada de regras (`/core`) contém apenas **funções puras**: entram números, saem números. Não importa React, não acessa banco, não conhece tela.

```
core/
  attributes.ts    modificador, base normalizada, custo de ponto
  progression.ts   curva de XP, nível, pontos por nível
  fatigue.ts       acúmulo, recuperação, efeito sobre atributos
  combat.ts        dano, defesa, crítico, resolução de turno
  cards.ts         geração, raridade, validação de deck
  bioimpedance.ts  delta, conversão em pontos, tetos
```

Toda função dessa pasta precisa de teste unitário cobrindo os casos extremos: usuário muito leve, muito pesado, sem bioimpedância, nível 1, nível 20, atributo 1, atributo 20, fadiga máxima.

**Cálculos que geram recompensa rodam no servidor.** O cliente exibe; ele não decide. Cliente que calcula XP é cliente que é hackeado na primeira semana.

## 22. Modelo de dados

```sql
users
  id, email, created_at, birth_date, biological_sex, height_cm,
  timezone, is_minor, consent_health_data_at

characters
  id, user_id, name, class, level, xp_total, unallocated_points,
  fatigue_points, streak_days, streak_best, created_at

attributes
  character_id, str_base, str_allocated, dex_base, dex_allocated,
  con_base, con_allocated, int_base, int_allocated,
  wis_base, wis_allocated, cha_base, cha_allocated

body_compositions
  id, user_id, measured_at, weight_kg, skeletal_muscle_kg,
  lean_mass_kg, body_fat_pct, body_water_pct, bmr_kcal,
  points_granted, created_at

mission_templates
  id, category, difficulty, title, description,
  min_level, max_level, validation_type, xp_reward, gold_reward

missions
  id, character_id, template_id, category, difficulty,
  due_at, status, completed_at, validation_source, xp_awarded

epic_missions
  id, character_id, title, target_value, current_value,
  unit, deadline, status

cards
  id, name, type, rarity, energy_cost, base_damage, base_heal,
  scaling_attribute, effects_json, class_restriction

card_instances
  id, character_id, card_id, obtained_at, source_mission_id

decks
  id, character_id, name, is_active

deck_cards
  deck_id, card_instance_id

battles
  id, type, attacker_character_id, defender_character_id,
  monster_id, status, current_turn, state_json, winner_id,
  created_at, finished_at

guilds
  id, name, created_by, created_at

guild_members
  guild_id, character_id, role, joined_at

mission_challenges
  mission_id, challenger_character_id, created_at

rest_days
  character_id, date, declared_at

transactions
  id, character_id, type, amount, reason, created_at
```

Índices obrigatórios: `missions(character_id, due_at)`, `battles(defender_character_id, status)`, `body_compositions(user_id, measured_at)`.

Row Level Security ativada em todas as tabelas. Política padrão: o usuário lê e escreve apenas linhas do próprio `user_id`, com exceção das leituras públicas de ranking, que devem passar por uma view que expõe somente nível, sequência e vitórias.

## 23. Telas

1. **Onboarding** — cadastro, dados corporais básicos, rotina semanal, escolha de classe, criação do personagem. Meta: menos de 3 minutos até a primeira missão.
2. **Início** — missões do dia, barra de XP, aviso de Fadiga, sequência.
3. **Ficha** — atributos, distribuição de pontos, equipamento, histórico de evolução.
4. **Medição** — registro de bioimpedância e gráficos privados.
5. **Deck** — coleção de cartas, montagem e edição de decks.
6. **Batalha** — seleção de modo, tabuleiro, resolução de turno.
7. **Guilda** — membros, atividade do dia, metas coletivas, contestação.
8. **Ranking** — três abas.
9. **Perfil** — configurações, privacidade, exportar dados, excluir conta, Sobre com a atribuição do SRD.

---

# Parte VIII — Execução

## 24. Roadmap

### Versão 1 — validação do laço central

Autenticação, onboarding, criação de personagem, ficha completa, registro de bioimpedância, missões diárias e semanais, XP e níveis, Fadiga, Descanso Sagrado, guilda, ranking de amigos, integração com Health Connect e HealthKit, cronômetro de estudo.

**Sem cartas e sem batalha.**

A versão 1 responde a uma única pergunta: o ciclo de missão e progressão, sozinho, retém o usuário por três semanas? Se a resposta for não, cartas não resolvem — significa que o problema está no laço central, e construir combate em cima de uma base que não prende só multiplica o custo do erro.

### Versão 2 — o jogo

Geração de cartas por missão, coleção, montagem de deck, combate PvE por capítulos, economia de ouro, equipamento.

### Versão 3 — competição

PvP assíncrono, convites por link, temporadas, metas de guilda, reforja de cartas, cosméticos.

## 25. Ordem de construção

1. Modelagem do banco e políticas de Row Level Security
2. Camada `/core` completa, com testes, **antes de qualquer tela**
3. Autenticação e onboarding
4. Missões e progressão
5. Fadiga e sequência
6. Bioimpedância e ficha
7. Social e ranking
8. Integrações de saúde
9. Sincronização offline

A camada de regras vem antes da interface porque é onde mora o produto. Interface bonita sobre balanceamento errado é retrabalho garantido.

## 26. Métricas de sucesso da versão 1

| Métrica | Meta |
|---|---|
| Retenção em 1 dia | ≥ 40% |
| Retenção em 7 dias | ≥ 20% |
| Retenção em 30 dias | ≥ 10% |
| Missões concluídas por usuário ativo por dia | ≥ 2,5 |
| Usuários com Fadiga ≥ 3 | ≤ 25% |
| Onboarding concluído | ≥ 70% dos cadastros |
| Tempo até a primeira missão concluída | ≤ 10 minutos |

Se a retenção em 30 dias ficar abaixo de 10%, não seguir para a versão 2. Reavaliar o laço central.

## 27. Critérios de aceite da versão 1

- Usuário novo cria conta, monta personagem e entende o que fazer em menos de 3 minutos.
- Usuário sobe para o nível 2 na primeira sessão.
- Todos os testes da camada `/core` passam, incluindo os casos extremos listados na seção 21.1.
- Dois usuários de portes corporais muito diferentes, ambos medianos para o próprio perfil, começam com atributos base equivalentes.
- Usuário ausente por 30 dias retorna ao estado pleno em no máximo 5 dias de uso.
- Nenhum dado de composição corporal aparece em qualquer tela compartilhada, ranking ou perfil de terceiros.
- Conta de usuário menor de 18 anos não exibe nem coleta dado de composição corporal.
- Registro de missão funciona sem conexão e sincroniza ao reconectar.
- A tela Sobre exibe a atribuição do SRD 5.2 em fonte legível.
- Nenhum cálculo que gere XP, ouro ou carta é executado no cliente.

---

**Fim do documento.**
