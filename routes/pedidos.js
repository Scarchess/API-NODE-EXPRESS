const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

// RETONAR TODOS OS PEDIDOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error
            })
        }
        conn.query(
            'SELECT * FROM pedidos',
            (error, result, fields) => {
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }
                const response = {
                    quantidade: result.length,
                    pedidos: result.map(pedido => {
                        return {
                            id_pedido: pedido.id_pedido,
                            id_produto: pedido.id_produto,
                            quantidade: pedido.quantidade,
                            request: {
                                tipo: 'GET',
                                descrição: 'Retorna os detalhes de um pedido especifico',
                                url: 'http://localhost:3000/pedidos/' + pedido.id_pedido
                            }
                        }
                    })
                }
                return res.status(200).send({
                    response
                })
            }
        )
    });
});

// INSERE UM PEDIDO
router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error
            })
        }
        conn.query('SELECT * FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, result, fields) => {
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }
                if (result.lenght == 0) {
                    return res.status(404).send({
                        mensagem: 'Produto não encontrado'
                    })
                }

                conn.query(
                    'INSERT INTO pedidos (id_produto, quantidade) VALUES (?, ?)',
                    [req.body.id_produto, req.body.quantidade],
                    (error, result, fields) => {
                        conn.release();
                        if (error) {
                            return res.status(500).send({
                                error: error
                            })
                        }
                        const response = {
                            mensagem: 'Pedido inserido com sucesso',
                            pedidoCriado: {
                                id_pedido: result.id_pedido,
                                id_produto: req.body.id_produto,
                                quantidade: req.body.quantidade,
                                request: {
                                    tipo: 'GET',
                                    descrição: 'Retorna todos os pedidos',
                                    url: 'http://localhost:3000/pedidos'
                                }
                            }
                        }
                        return res.status(201).send({
                            response
                        });
                    }
                )
            })
    });
});

// RETORNA DADOS DE UM UNICO PEDIDO
router.get('/:id_pedido', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error
            })
        }
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [req.params.id_pedido],
            (error, result, fields) => {
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }

                if (result.lenght == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com este ID'
                    })
                }
                const response = {
                    pedido: {
                        id_pedido: result[0].id_pedido,
                        id_produto: result[0].id_produto,
                        quantidade: result[0].quantidade,
                        request: {
                            tipo: 'GET',
                            descrição: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos'
                        }
                    }
                }
                return res.status(200).send({
                    response
                });
            }
        )
    });
});

// ALTERA UM PEDIDO
router.patch('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando o PATCH dentro da rota de produtos'
    });
});

// EXCLUI UM PEDIDO
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error
            })
        };
        conn.query(
            `DELETE FROM pedidos WHERE id_pedido = ?`,
            [req.body.id_pedido],
            (error, result, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({
                        error: error
                    })
                }
                const response = {
                    mensagem: 'pedido removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um pedido',
                        url: 'http://localhost:3000/pedidos',
                        body: {
                            id_produto: 'number',
                            quantidade: 'number'
                        }
                    }
                }
                res.status(202).send(response);
            }
        )
    });
});

module.exports = router;