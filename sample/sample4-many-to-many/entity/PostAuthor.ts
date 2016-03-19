import {PrimaryColumn, Column} from "../../../src/decorator/Columns";
import {Table} from "../../../src/decorator/Tables";
import {Post} from "./Post";
import {ManyToManyInverse} from "../../../src/decorator/Relations";

@Table("sample4_post_author")
export class PostAuthor {

    @PrimaryColumn("int", { autoIncrement: true })
    id: number;

    @Column()
    name: string;

    @ManyToManyInverse<Post>(() => Post, post => post.authors)
    posts: Post[];

}