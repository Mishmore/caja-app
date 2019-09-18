import { Component, OnInit } from '@angular/core';
import { AppState } from '../../app.reducer'
import { Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { IngresoEgreso } from '../ingreso-egreso.model'

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
  styles: []
})
export class EstadisticaComponent implements OnInit {

  ingresos: number
  egresos: number

  cantidadIngresos: number
  cantidadEgresos: number

  subscription: Subscription = new Subscription()

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('ingresoEgreso')
      .subscribe(ingresoEgreso => {
        this.contarIngresoEgreso(ingresoEgreso.items)
      })
  }

  contarIngresoEgreso(items: IngresoEgreso[]) {
    this.ingresos = 0
    this.egresos = 0
    this.cantidadEgresos = 0
    this.cantidadIngresos = 0

    items.map(item => {
      if (item.tipo === 'ingreso') {
        this.cantidadIngresos++
        this.ingresos += item.monto
      }

      if (item.tipo === 'egreso') {
        this.cantidadEgresos++
        this.egresos += item.monto
      }
    })
  }

}
