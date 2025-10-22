// src/app/services/via-cep.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViaCepResponse } from '../models/via-cep-response';

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private baseUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<ViaCepResponse> {
    const cepLimpo = cep.replace(/\D/g, ''); // remove tudo que não for número
    return this.http.get<ViaCepResponse>(`${this.baseUrl}/${cepLimpo}/json/`);
  }
}
