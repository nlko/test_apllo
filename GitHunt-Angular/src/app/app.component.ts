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
    mutation removeOrganization($id:String!) {removeOrganization(id:$id)}
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

  // Get extract essential data for queries update helpers parameters
  private getOriginalList = (queryNameToUpdate: string, previous: any) =>
    // Get the previous list or an empty one
    R.propOr([], queryNameToUpdate, previous)

  // Get extract essential data for queries update helpers parameters
  private getMutationData = (currentQueryName: string, mutationResult: any) =>
    // Get the element ot add or undefined
    R.path(['data', currentQueryName], (mutationResult as any))


  // Function to update a list fith a provide function
  // if the list is undefined return an empty list
  private updateList = R.curry((func, lst: any[]) =>
    R.ifElse(
      R.isNil,
      R.curry(_ => [] as any),
      func
    )(lst),
  )

  private listAdd = R.curry((queryNameToUpdate: string, currentQueryName: string, previous: any, { mutationResult }) => {
    // Get the previous list or an empty one
    const list = this.getOriginalList(queryNameToUpdate, previous)
    // Get new element result of the mutation
    const elt = this.getMutationData(currentQueryName, mutationResult)

    // Function to add a element to a list
    // If the element is undefined return the same list
    const appendIfElemIsntNull = R.curry((elt: any, lst: any[]) =>
      R.ifElse(
        R.isNil,
        R.curry(_ => lst),
        R.curry(x => R.append(x, lst)),
      )(elt))

    // Create an object with an attribute with name contained in queryNameToUpdate
    // Set this attribute to the new list value
    const newList = R.set(
      R.lensProp(queryNameToUpdate),
      this.updateList(appendIfElemIsntNull(elt), list as any[]),
      {})

    return newList
  })

  private listDelete = R.curry((queryNameToUpdate: string, filterFunc, previous: any, { mutationResult }) => {
    // Get the previous list or an empty one
    const list = this.getOriginalList(queryNameToUpdate, previous)

    // Create an object with an attribute with name contained in queryNameToUpdate
    // Set this attribute to the new list value
    const newList = R.set(
      R.lensProp(queryNameToUpdate),
      this.updateList(filterFunc, list as any[]),
      {})

    return newList
  })

  // Helper for building a query update param for add mutation
  private addUpdateQueries = (queryNameToUpdate: string, currentQueryName: string) =>
    R.set(
      R.lensProp(queryNameToUpdate),
      this.listAdd(queryNameToUpdate, currentQueryName),
      {})

  // Helper for building a query update param for delete mutation
  private deleteUpdateQueries = (queryNameToUpdate: string, filter) =>
    R.set(
      R.lensProp(queryNameToUpdate),
      this.listDelete(queryNameToUpdate, filter),
      {})

  // Helper for building an optimistic response object
  private optimisticResponse = (currentQueryName: string, type: string, data = {}) =>
    R.set(
      R.lensProp(currentQueryName),
      R.set(
        R.lensProp('__typename'),
        type,
        data
      ),
      { __typename: 'Mutation' })


  public onAdd() {

    this.status = "Adding..."

    this.apollo.mutate({
      mutation: this.add,
      variables: {
        "name": "test"
      },
      updateQueries: this.addUpdateQueries('organizations', 'createOrganization'),
      optimisticResponse: this.optimisticResponse('createOrganization', 'Organization', {
        id: "...",
        name: "test optimistic",
      }),
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
      updateQueries: this.deleteUpdateQueries('organizations', R.filter(R.compose(R.not, R.pathEq(['id'], id)))),
      optimisticResponse: this.optimisticResponse('removeOrganization', 'Organization', {}),
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
      optimisticResponse: this.optimisticResponse('updateOrganization', 'Organization', {
        id: id,
        name: newName,
      }),
    }).subscribe(
      (data) => { console.dir(data) },
      (error) => {
        console.dir(error)
        this.status = error
      },
      () => { this.status = null; console.log('Done changing') })
  }

}
