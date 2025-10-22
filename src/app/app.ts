import { Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import html2canvas from 'html2canvas';
import { Produto } from './services/produto';
import { IProduct } from './models/IProduct';
import { IResult } from './models/IResult';
import { ViaCepService } from './services/via-cep.service';
import { ViaCepResponse } from './models/via-cep-response';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    NgxMaskDirective
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  lstproducts: IProduct[] = [];
  currentProduct: IProduct = { name: '', ammount: 0, quantity: 1, selected: true };
  editProduct: IProduct = { name: '', ammount: 0, quantity: 1, selected: true };
  editIndex: number | null = null;
  editErrorMessages: { [key: number]: string } = {};
  mostrarEmail = false;
  fotoPerfil: string | null = null;
  selectAll = false;
  showExplanation = false;
  sortAscending = true;
  isDarkMode = false;
  showReloadModal = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  cepDigitado: string = '';
  valorFrete: number | null = null;
  totalComFrete: number = 0;
  mostrarModalFrete = false;
  endereco: string | null = null;
  totalCompra: number = 0; // total só dos produtos
  cep: string='';
  successNotification: string | null = null;
  freteGratisAtivo: boolean = false;
  cepInvalido: boolean = false;
  
  


  constructor(
  private produtoService: Produto,
  private http: HttpClient){}
  precoFrete: number = 0;


  ngOnInit() {
    const saved = localStorage.getItem('SupermarketProducts');
    if (saved && saved !== '[]') {
      this.showReloadModal = true;
    }
    this.loadProducts();
  }

  // ✅ Carregar produtos da API
  loadProducts(): void {
  this.produtoService.getItems().subscribe({
    next: (res) => {
      this.lstproducts = (res.data as IProduct[]).map(p => ({
        ...p,
        selected: true
      }));
      this.selectAll = true;
      this.successMessage = res.message;
      this.clearMenssages();
    },
    error: (err) => {
      this.errorMessage = err.error?.friendlyErrorMessage || 'Erro ao carregar produtos.';
      this.clearMenssages();
    }
  });

  }

  // ✅ Adicionar produto via API
  addProduct(): void {
    const newName = this.currentProduct.name.trim().toLowerCase();
    const alreadyExists = this.lstproducts.some(
      (p) => p.name.trim().toLowerCase() === newName
    );

    if (
      newName === '' ||
      this.currentProduct.ammount <= 0 ||
      this.currentProduct.quantity <= 0
    ) {
      this.successMessage = 'Preencha todos os campos corretamente!';
      this.clearMenssages();
      return;
    }

    if (alreadyExists) {
      this.successMessage = 'Esse produto já foi adicionado!';
      this.clearMenssages();
      return;
    }

    this.produtoService.addItem(this.currentProduct).subscribe({
      next: (res) => {
        const newProduct = res.data as IProduct;
        this.lstproducts.push({ ...newProduct, selected: true });
        this.saveProductsToStorage();  // <-- SALVA NO localStorage
        this.successMessage = res.message;
        this.currentProduct = { name: '', ammount: 0, quantity: 1, selected: true };
        this.clearMenssages();
      },
      error: (err) => {
        this.errorMessage = err.error?.friendlyErrorMessage || 'Erro ao adicionar produto.';
        this.clearMenssages();
      }
    });
  }

  // ✅ Deletar produto via API
  DeleteProduct(index: number): void {
  const product = this.lstproducts[index];

  // Verifica se produto tem id para deletar no backend
  if (!product.id) {
    alert("Este produto ainda não foi salvo no servidor e não pode ser deletado.");
    return;
  }

  const confirmed = confirm(`Remover "${product.name}"?`);
  if (!confirmed) return;

  this.produtoService.deleteItem(product.id).subscribe({
    next: (res) => {
      this.lstproducts.splice(index, 1);
      this.saveProductsToStorage();
      this.successMessage = res.message;
      this.clearMenssages();
    },
    error: (err) => {
      this.errorMessage = err.error?.friendlyErrorMessage || 'Erro ao remover produto.';
      this.clearMenssages();
    }
  });
}
  // ✅ Editar produto via API
  ToggleEdit(index: number): void {
  if (this.editIndex === index) {
    const newName = this.editProduct.name.trim().toLowerCase();
    const alreadyExists = this.lstproducts.some(
      (p, i) => i !== index && p.name.trim().toLowerCase() === newName
    );

    if (
      this.editProduct.name.trim() !== '' &&
      this.editProduct.ammount > 0 &&
      this.editProduct.quantity > 0
    ) {
      if (alreadyExists) {
        this.editErrorMessages[index] = 'Esse item já está na lista!';
        this.clearMenssages(index);
        return;
      }

      const confirmed = confirm(`Deseja salvar alterações em "${this.editProduct.name}"?`);
      if (!confirmed) return;

      this.produtoService.updateItem(this.editProduct).subscribe({
        next: (res) => {
          this.lstproducts[index] = res.data as IProduct;
          this.saveProductsToStorage();
          this.successMessage = res.message;
          this.editIndex = null;
          this.editErrorMessages[index] = ''; // limpa mensagem
          this.clearMenssages();
        },
        error: (err) => {
          this.errorMessage = err.error?.friendlyErrorMessage || 'Erro ao editar produto.';
          this.clearMenssages();
        }
      });
    } else {
      this.editErrorMessages[index] = 'Preencha todos os campos corretamente.';
      this.clearMenssages(index);
    }
  } else {
    this.editIndex = index;
    this.editProduct = { ...this.lstproducts[index] };
    this.editErrorMessages[index] = ''; // limpa mensagem ao entrar em edição
  }
}



  // ✅ Outras funcionalidades
  CalculateTotal(): number {
    return this.lstproducts.reduce((sum, p) => sum + p.ammount * p.quantity, 0);
  }

  clearMenssages(index?: number) {
  setTimeout(() => {
    if (index !== undefined) {
      this.editErrorMessages[index] = '';
    } else {
      this.successMessage = null;
      this.errorMessage = null;
    }
  }, 3000);
}


  toggleSelectAll() {
    this.lstproducts.forEach(p => p.selected = this.selectAll);
  }

  onToggleIndividual() {
    this.selectAll = this.lstproducts.every(p => p.selected);
  }

  getProdutosSelecionados(): IProduct[] {
    return this.lstproducts.filter(p => p.selected);
  }

  getTotalSelecionado(): number {
    return this.getProdutosSelecionados()
      .reduce((sum, p) => sum + p.ammount * p.quantity, 0);
  }

  getQuantidadeSelecionada(): number {
    return this.getProdutosSelecionados()
      .reduce((sum, p) => sum + p.quantity, 0);
  }

  ordenarPorPreco() {
    this.sortAscending = !this.sortAscending;
    this.lstproducts.sort((a, b) => {
      return this.sortAscending
        ? a.ammount - b.ammount
        : b.ammount - a.ammount;
    });
  }

  carregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.fotoPerfil = e.target.result;
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  toggleMostrarEmail() {
    this.mostrarEmail = !this.mostrarEmail;
  }

  abrirSeletorFoto(event: MouseEvent) {
    event.stopPropagation();
    const inputFile = document.getElementById('fotoInput') as HTMLInputElement;
    if (inputFile) {
      inputFile.click();
    }
  }

  toggleExplanation() {
    this.showExplanation = !this.showExplanation;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  downloadTableAsImage() {
    const tabela = document.getElementById('tableToDownload');
    if (!tabela) return;

    html2canvas(tabela).then(canvas => {
      const link = document.createElement('a');
      link.download = 'tabela-supermercado.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
  // 💾 Salvar a tabela atual no localStorage
  saveProductsToStorage() {
    localStorage.setItem('SupermarketProducts', JSON.stringify(this.lstproducts));
  }

deleteSelected() {
  const produtosSelecionados = this.getProdutosSelecionados();

  // Filtra só os que têm id para deletar no backend
  const produtosComId = produtosSelecionados.filter(p => p.id);

  if (produtosComId.length === 0) {
    alert('Nenhum produto selecionado para deletar que esteja salvo no servidor.');
    return;
  }

  const confirmed = confirm('Tem certeza que deseja deletar todos os produtos selecionados?');
  if (!confirmed) return;

  // Usando Promise.all para esperar todas as deleções
  const deletePromises = produtosComId.map(product =>
    this.produtoService.deleteItem(product.id!).toPromise()
  );

  Promise.all(deletePromises)
    .then(() => {
      // Atualiza a lista local removendo os deletados
      this.lstproducts = this.lstproducts.filter(product => !product.selected || !product.id);
      this.selectAll = false;
      this.saveProductsToStorage();
      this.successMessage = 'Produtos selecionados foram deletados com sucesso!';
      setTimeout(() => this.successMessage = '', 3000);
    })
    .catch(() => {
      this.errorMessage = 'Erro ao deletar um ou mais produtos.';
      setTimeout(() => this.errorMessage = '', 3000);
    });
}

 abrirModalFrete() {
  this.mostrarModalFrete = true;
  this.cepDigitado = '';
  this.valorFrete = null;
  this.totalComFrete = 0;
}

fecharModalFrete() {
  this.mostrarModalFrete = false;
}

onCepChange() {
  const cepLimpo = this.cepDigitado.replace(/\D/g, '');

  // Se CEP estiver incompleto, já mostra erro
  if (cepLimpo.length === 0) {
    // Nenhum número digitado, esconde a mensagem
    this.cepInvalido = false;
    this.valorFrete = null;
    this.totalComFrete = 0;
    this.endereco = '';
    return;
  }

  if (cepLimpo.length < 8) {
    // CEP incompleto, mostra mensagem de erro
    this.cepInvalido = true;
    this.valorFrete = null;
    this.totalComFrete = 0;
    this.endereco = '';
    return;
  }

  // CEP completo, faz consulta na API
  fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        this.cepInvalido = true;  // CEP inválido
        this.valorFrete = null;
        this.totalComFrete = 0;
        this.endereco = '';
        return;
      }

      this.cepInvalido = false; // CEP válido
      this.endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;

      const totalCompra = this.getTotalSelecionado();

      if (totalCompra >= 20) {
        this.valorFrete = 0;
      } else {
        const primeiroDigito = cepLimpo.charAt(0);
        switch (primeiroDigito) {
          case '0':
            this.valorFrete = 10;
            break;
          case '1':
            this.valorFrete = 15;
            break;
          case '2':
            this.valorFrete = 20;
            break;
          default:
            this.valorFrete = 25;
        }
      }

      this.totalComFrete = totalCompra + this.valorFrete;
    })
    .catch(() => {
      this.cepInvalido = true;
      this.valorFrete = null;
      this.totalComFrete = 0;
      this.endereco = '';
    });
}


confirmarCompra() {
  const cepLimpo = this.cepDigitado.replace(/\D/g, '');

  if (!cepLimpo || cepLimpo.length !== 8) {
    alert('Por favor, insira um CEP válido antes de confirmar a compra.');
    return;
  }

  if (this.valorFrete === null) {
    alert('Calcule o frete antes de confirmar a compra.');
    return;
  }

  // Pega todos os produtos que têm ID (existem no backend)
  const produtosComId = this.lstproducts.filter(p => p.id);

  // Cria um array de promessas para deletar todos no backend
  const deletePromises = produtosComId.map(p => this.produtoService.deleteItem(p.id!).toPromise());

  Promise.all(deletePromises)
    .then(() => {
      // Depois que todos forem deletados, limpa o frontend
      this.lstproducts = [];
      localStorage.removeItem('SupermarketProducts');
      this.selectAll = false;
      this.mostrarModalFrete = false;

      this.successNotification = 'Compra feita com sucesso!';

      setTimeout(() => {
        this.successNotification = null;
      }, 3000);
    })
    .catch(() => {
      alert('Erro ao deletar produtos no servidor. Tente novamente.');
    });
}




}