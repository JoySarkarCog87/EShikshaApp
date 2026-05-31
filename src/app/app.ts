import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Loading } from './components/loading/loading';
import { LoadingService } from './services/loading-service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, Loading],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('E-Shiksha');
  private loadingService = inject(LoadingService);

  loading = signal<boolean>(false);

  ngOnInit(){
    this.loadingService.isLoading$.subscribe(res=>{
      this.loading.set(res);
    })
  }


}
