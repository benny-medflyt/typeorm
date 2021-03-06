import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {Post} from "./entity/Post";
import {Author} from "./entity/Author";
import {Abbreviation} from "./entity/Abbreviation";

describe("github issues > #215 invalid replacements of join conditions", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchemaOnConnection: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should not do invalid replacements of join conditions", () => Promise.all(connections.map(async connection => {

        const author = new Author();
        author.name = "John Doe";
        await connection.entityManager.persist(author);

        const abbrev = new Abbreviation();
        abbrev.name = "test";
        await connection.entityManager.persist(abbrev);

        const post = new Post();
        post.author = author;
        post.abbreviation = abbrev;
        await connection.entityManager.persist(post);

        // generated query should end with "ON p.abbreviation_id = ab.id"
        // not with ON p.abbreviation.id = ab.id (notice the dot) which would
        // produce an error.
        const loadedPosts = await connection.entityManager
            .createQueryBuilder(Post, "p")
            .leftJoinAndMapOne("p.author", Author, "n", "p.author_id = n.id")
            .leftJoinAndMapOne("p.abbreviation", Abbreviation, "ab", "p.abbreviation_id = ab.id")
            .getMany();

        loadedPosts.length.should.be.equal(1);
    })));

});