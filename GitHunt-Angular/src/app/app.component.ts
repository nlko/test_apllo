import { Component, OnInit } from '@angular/core';
import * as Rx from 'rxjs'
import gql from 'graphql-tag';
import { Apollo, ApolloQueryObservable } from 'apollo-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public organizations: any[] = []
  public status = null

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

  change = gql`
    mutation updateOrganization($id:String!,$name:String!){
      updateOrganization(id:$id,name:$name){id,name}}
  `

  constructor(private apollo: Apollo) { }

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

    Rx.Observable.from(fetchQuery$)
      .map(({data}) => (data as any).organizations)
      .subscribe(organizations => {
        console.log('organizations updated')
        this.organizations = organizations
      },
      (error) => {
        console.dir(error)
        this.status = error
      },
      () => {
        this.status = null
        console.log('Done loading')
      })
  }

  add = gql`mutation createOrganization($name:String!) {createOrganization(name:$name){id,name}}`


  public onAdd() {

    this.status = "Adding..."

    this.apollo.mutate({
      mutation: this.add,
      variables: {
        "name": "test"
      },
      updateQueries: {
        organizations: (prev, {mutationResult }) => {
          const organizations = (prev as any).organizations
          const elt = (mutationResult as any).data.createOrganization
          return { organizations: [...organizations, elt] }
        }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createOrganization: {
          id: "...",
          name: "test optimistic",
          __typename: 'Organization',
        },
      },
    }).subscribe(
      (data) => { console.dir(data) },
      (error) => {
        console.dir(error)
      },
      () => { this.status = null; console.log('Done adding') })
  }

  public onDelete($event, id) {
    this.status = `Removing ${id}`
    this.apollo.mutate({
      mutation: this.removeQuery,
      variables: {
        id: id
      },
      updateQueries: {
        organizations: (prev, {mutationResult }) => {
          const organizations = (prev as any).organizations
          return { organizations: organizations.filter((e: any) => e.id != id) }
        }
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createOrganization: {
          //          id: id,
          __typename: 'Organization',
        },
      },
    }).subscribe(
      (data) => { console.dir(data) },
      (error) => {
        console.dir(error)
        this.status = error
      },
      () => { this.status = null; console.log('Done removing') })
  }

  public counter = 0;

  public onChange($event, id) {
    this.status = `Changing ${id}`
    const newName = "Changed ! " + this.counter++
    const changeQuery$ = this.apollo.mutate({
      mutation: this.change,
      variables: {
        "id": id,
        "name": newName
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateOrganization: {
          id: id,
          name: newName,
          __typename: 'Organization',
        },
      },
    }).subscribe(
      (data) => { console.dir(data) },
      (error) => {
        console.dir(error)
        this.status = error
      },
      () => { this.status = null; console.log('Done changing') })
  }

}
