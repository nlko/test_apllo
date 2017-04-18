import { Component, OnInit } from '@angular/core';
import * as Rx from 'rxjs'
import gql from 'graphql-tag';
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import * as R from 'ramda'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public organizations:any[] = []
  data: Rx.Observable<any>;
 
/*
ERROR in /home/thm/tmp/test_apolo/GitHunt-Angular/src/app/app.component.ts (56,5): Type 'Observable<any>' is not assignable to type 'ApolloQueryObservable<any>'.
  Property 'apollo' is missing in type 'Observable<any>'.)


*/

  getListQuery = gql`
    query organizations {
      organizations
      {
        id
        name
      }
    }
  `

  removeQuery = gql`
    mutation removeOrga($id:String!) {removeOrganization(id:$id)}
  `

  add = gql`
    mutation Add($name:String!) {createOrganization(name:$name){id,name}}
  `

  change = gql`
    mutation updateOrga($id:String!,$name:String!){
      updateOrganization(id:$id,name:$name){id,name}}
  `

  constructor(private apollo: Apollo) { }

  // emitter
  observable
  observer

  public fetchdata: any

  public ngOnInit() {



    const fetchQuery$ = this.apollo.watchQuery({
      query: this.getListQuery,
      //pollInterval: 5000
      /*
     variables: {
       repoFullName: this.repoName,
       limit: COMMENTS_PER_QUERY,
       offset: this.offset
     },*/
    })



    // this.data = this.apollo.watchQuery({ query:  this.getListQuery })
    //       .map(({data}) => null);

    /*this.organizations =
        // Rx.Observable.create(e => this.emitter = e)
          .startWith(null)
          .flatMap(_ => fetchQuery$)
          .map(data => {
            console.dir(data)
            return (data.data as any).organizations
          })*/

    Rx.Observable.from(fetchQuery$)

/*    EXCEPTION: this.apollo.watchQuery(...).map is not a function*/

      .map(({data}) => (data as any).organizations)
      .subscribe(organizations=>this.organizations = organizations)
    //this.organizations =fetchQuery$.map(data=>(data.data as any).organizations)
    /*const data = []

    this.organizations =
      Rx.Observable.interval(1000)
        .map(_=>{data.push({id:"1",name:"test"});return data})*/

    //
    // this.organizations.share().subscribe(
    //   (data) => null,
    //   (error) => console.dir(error),
    //   () => console.log('Fetch Finished')
    // )
  }

  public onAdd() {

    const addQuery$ = this.apollo.mutate({
      mutation: this.add,
      variables: {
        "name": "test"
      },
      /*optimisticResponse: {
        __typename: 'Mutation',
        Add: {
          __typename: 'Organization',
          name: "test optimistic",
        },
      },*/
    }).take(1)

    addQuery$.subscribe(
      ({data}) => {
        const elt  = (<any>data).createOrganization
        console.dir(elt);
        this.organizations.push(R.clone(elt))
        console.dir(this.organizations)

      },
      (error) => console.dir(error),
      () => {
        console.log('Add Finished')

        // this.emitter.next('foo')
      })
  }

  public onDelete($event, id) {
    console.dir(id)
    const removeQuery$ = this.apollo.mutate({
      mutation: this.removeQuery,
      variables: {
        id: id
      },
    })
  }

  public counter = 0;

  public onChange($event, id) {

    const addQuery$ = this.apollo.mutate({
      mutation: this.change,
      variables: {
        "id": id,
        "name": "Changed ! "+this.counter++
      },
    }).take(1)

    addQuery$.subscribe(
      (data) => console.dir(data),
      (error) => console.dir(error),
      () => {
        console.log('Change Finished')
        // this.emitter.next('foo')
      })
  }

}
