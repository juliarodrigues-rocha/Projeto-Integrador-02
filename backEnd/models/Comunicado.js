// padronizar respostas do backend enviadas ao front 
class Comunicado {
  constructor(status, mensagem) {
    this.status = status;
    this.mensagem = mensagem;
  }
}

export default Comunicado;
