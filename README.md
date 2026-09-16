# Projeto: Aplicação com persistência de dados em backend

![GIF](dino.gif)

## Acesso
https://rpfacco-dino-game.netlify.app

## Desenvolvedor(a)
Nome: Ricardo Facco Pigatto  
Curso: Sistemas de Informação


## Proposta
- Desenvolver um jogo estilo “Dino Game” (aquele joguinho do dinossauro que aparece no navegador sem internet)
- O jogo consiste de um personagem parado no canto esquerdo da tela, enquanto desvia de obstáculos (pulando) para sobreviver o maior tempo possível.
- É necessário persistência de dados, com uma tela de ranking mostrando os jogadores com maior score. Quanto mais o jogador sobrevive no jogo, maior o score.
- Não é preciso autenticação/login, porém é necessário um campo para que o usuário informe o ‘nome’ para ser colocado no ranking.
- O jogo é desenvolvido seguindo o conceito “mobile-first”, ou seja, prioriza a experiência em dispositivos móveis.

## Desenvolvimento

### Processo

Comecei o desenvolvimento pelo frontend, escrito em JavaScript com o framework Kaplay. Segui um vídeo tutorial que mostrava como re-criar o jogo Flappy Bird usando Kaplay, adaptando o desenvolvimento para criar o Dino Game. Esse framework é muito bom para desenvolver jogos, pois existem funções prontas para serem utilizadas, como o `onGround`, que detecta quando uma entidade está tocando o chão. O processo de criação da lógica do jogo foi fácil e divertida, e não tive grandes dificuldades com isso.

Após, comecei a desenvolver o backend, com o Python e o framework Flask. Também segui um vídeo tutorial que mostrava como configurar o Flask de maneira inicial, e depois disso utilizei ajuda de IA para me auxiliar com a sintaxe do Flask. Eu sabia que precisava de uma requisição `GET` e um `POST` para a criação do ranking, então trabalhei nisso, ao mesmo tempo criando o esquema do banco de dados.

Para o banco de dados, escolhi SQLite. Descobri que o SQLite não precisa de servidor nenhum, o banco inteiro é um único arquivo, o `ranking.db`. Criei a tabela `scores` em um arquivo `schema.sql`, e o próprio Python executa esse arquivo quando o servidor sobe. Dessa forma, criei a consulta na requisição `GET` que monta o ranking dos 10 melhores jogadores.

### Trechos de código

Como é feito a consulta no banco de dados pelo GET, com Flask:
```python
@app.get("/api/ranking")
def get_ranking():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT name, score
        FROM scores
        ORDER BY score DESC, id ASC
        LIMIT 10
        """
    ).fetchall()
    conn.close()

    ranking = [dict(row) for row in rows]
    return jsonify(ranking)
```
---

Abaixo, a maneira certa e errada de salvar um score novo.

```python
# jeito certo
conn.execute(
    "INSERT INTO scores (name, score) VALUES (?, ?)",
    (name, score),
)
conn.commit()
```

```python
# jeito errado
conn.execute(f"INSERT INTO scores (name, score) VALUES ('{name}', {score})")
```
Note os dois '?'. Em vez de eu grudar o nome dentro do texto do comando SQL, eu mando o comando de um lado e os valores do outro, e o banco trata o nome sempre como texto comum.


## Tecnologias

### Linguagens e afins

- Kaplay - **Frontend**
- Python com Flask - **Backend**
- SQLite - **Banco de dados**
- PythonAnywhere e Netifly - **Hospedagem back e front**

### Ambiente de desenvolvimento

- IntelliJ IDEA
- Git e GitHub

## Referências e créditos

- https://youtu.be/9NdeMbMzC2A?si=m6GPu-o06-u_NMDr - Kaplay + Flappy Bird by Justin Lee
- https://youtu.be/2GGwz8zUy2M?si=3IqnNBmHpSXSxA4G - Flask setup tutorial by Noah Does Coding

---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
