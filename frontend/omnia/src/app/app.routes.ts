import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PlanejamentoComponent } from './pages/planejamento/planejamento.component';
import { ChecklistComponent } from './pages/checklist/checklist.component';
import { ResultadosComponent } from './pages/resultados/resultados.component';
import { AprovacaoComponent } from './pages/aprovacao/aprovacao.component';
import { AprovacaoProcessoComponent } from './pages/aprovacao-processo/aprovacao-processo.component';
import { CriarRegraComponent } from './pages/criar-regra/criar-regra.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'planejamento', component: PlanejamentoComponent },
  { path: 'checklist', component: ChecklistComponent },
  { path: 'resultados', component: ResultadosComponent },
  { path: 'aprovacao', component: AprovacaoComponent },
  { path: 'aprovacao-processo', component: AprovacaoProcessoComponent },
  { path: 'criar-regra', component: CriarRegraComponent },
  { path: '**', component: NotFoundComponent },
];
