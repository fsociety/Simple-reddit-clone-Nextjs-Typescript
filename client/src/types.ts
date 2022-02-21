export interface Post {
    identifier: string
    title: string
    body: string
    slug: string
    subName: string
    username: string
    createdAt: string
    updatedAt: string
    // Virtual field
    url: string
    voteScore?: number
    commentCount?: number
    userVote?: number
    sub?: Sub
}

export interface User {
    username: string,
    email: string,
    bio: string,
    createdAt: string,
    updatedAt: string
}

export interface Sub{    
        createdAt: string,
        updatedAt: string,
        name: string,
        title: string,
        description: string,
        imageUrn: string,
        bannerUrn: string,
        username: string,
        posts: Post[],
        imageUrl: string,
        bannerUrl: string,
        postCount?: Number
}

export interface Comment{
    createdAt: string,
    updatedAt: string,
    identifier: string,
    body: string,
    username: string,
    userVote: number
    voteScore: number
}