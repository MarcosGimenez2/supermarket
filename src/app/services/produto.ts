import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResult } from '../models/IResult';
import { IProduct } from '../models/IProduct';

@Injectable({
  providedIn: 'root'
})
export class Produto {
  private apiUrl = 'https://localhost:7023/api/SuperMarket'; // <-- Corrigido aqui, sem GetItems

  constructor(private http: HttpClient) {}

  getItems(): Observable<IResult> {
    // rota correta: /GetItems
    return this.http.get<IResult>(`${this.apiUrl}/GetItems`);
  }

  getItemById(id: number): Observable<IResult> {
    // rota correta: /GetItemById?id=...
    return this.http.get<IResult>(`${this.apiUrl}/GetItemById?id=${id}`);
  }

  addItem(product: IProduct): Observable<IResult> {
    // rota correta: /AddItem
    return this.http.post<IResult>(`${this.apiUrl}/AddItem`, product);
  }

  updateItem(product: IProduct): Observable<IResult> {
    // rota correta: /UpdateItem
    return this.http.put<IResult>(`${this.apiUrl}/UpdateItem`, product);
  }

  deleteItem(id: number): Observable<IResult> {
    // rota correta: /DeleteItem?idItem=...
    return this.http.delete<IResult>(`${this.apiUrl}/DeleteItem?idItem=${id}`);
  }
}
