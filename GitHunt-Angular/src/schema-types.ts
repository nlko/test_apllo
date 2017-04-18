// A comment about an entry, submitted by a user
export interface Comment {
  // The SQL ID of this entry
  id: number;

  // The GitHub user who posted the comment
  postedBy: User;

  // A timestamp of when the comment was posted
  createdAt: number;

  // The text of the comment
  content: string;

  // The repository which this comment is about
  repoName: string;
}

// Information about a GitHub repository submitted to GitHunt
export interface Entry {
  // Information about the repository from GitHub
  repository: Repository;

  // The GitHub user who submitted this entry
  postedBy: User;

  // A timestamp of when the entry was submitted
  createdAt: number;

  // The score of this repository, upvotes - downvotes
  score: number;

  // The number of comments posted about this repository
  commentCount: number;

  // The SQL ID of this entry
  id: number;

  // XXX to be changed
  vote: Vote;

  // Comments posted about this repository
  comments(limit: number, offset: number): [Comment];
}

// A list of options for the sort order of the feed
export enum FeedType {
  // Sort by a combination of freshness and score, using Reddit's algorithm
  HOT,
  // Newest entries first
  NEW,
  // Highest score entries first
  TOP
}

export interface Mutation {
  // Submit a new repository, returns the new submission
  submitRepository(repoFullName: string): Entry;

  // Vote on a repository submission, returns the submission that was voted on
  vote(
    // The full repository name from GitHub, e.g. "apollostack/GitHunt-API"
    repoFullName: string,
    // The export interface of vote - UP, DOWN, or CANCEL
    type: VoteType): Entry;

  // Comment on a repository, returns the new comment
  submitComment(
    // The full repository name from GitHub, e.g. "apollostack/GitHunt-API"
    repoFullName: string,
    // The text content for the new comment
    commentContent: string): Comment;
}

export interface Query {
  // Return the currently logged in user, or null if nobody is logged in
  currentUser: User;

  // A feed of repository submissions
  feed(
    // The sort order for the feed
    type: FeedType,
    // The number of items to skip, for pagination
    offset: number,
    // The number of items to fetch starting from the offset, for pagination
    limit: number,
    // The text to mach repo name for searching
    repoName: string): [Entry];

  // A single entry
  entry(
    // The full repository name from GitHub, e.g. "apollostack/GitHunt-API"
    repoFullName: string): Entry;

}

// A repository object from the GitHub API. This uses the exact field names returned by the
// GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
export interface Repository {
  // Just the name of the repository, e.g. GitHunt-API
  name: string;

  // The full name of the repository with the username, e.g. apollostack/GitHunt-API
  full_name: string;

  // The description of the repository
  description: string;

  // The link to the repository on GitHub
  html_url: string;

  // The number of people who have starred this repository on GitHub
  stargazers_count: number;

  // The number of open issues on this repository on GitHub
  open_issues_count: number;

  // The owner of this repository on GitHub, e.g. apollostack
  owner: User;
}

export interface Subscription {
  // Subscription fires on every comment added
  commentAdded(repoFullName: string): Comment;
}

// A user object from the GitHub API. This uses the exact field names returned from the GitHub API.
export interface User {
  // The name of the user, e.g. apollostack
  login: string;

  // The URL to a directly embeddable image for this user's avatar
  avatar_url: string;

  // The URL of this user's GitHub page
  html_url: string;
}

// XXX to be removed
export interface Vote {
  vote_value: VoteType;
}

// The export interface of vote to record, when submitting a vote
export enum VoteType {
  UP,
  DOWN,
  CANCEL
}
