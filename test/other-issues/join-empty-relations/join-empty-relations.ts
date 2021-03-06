import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {Post} from "./entity/Post";
import {expect} from "chai";

describe("other issues > joining empty relations", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchemaOnConnection: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should return empty array if its joined and nothing was found", () => Promise.all(connections.map(async function(connection) {

        const post = new Post();
        post.title = "Hello Post";
        await connection.entityManager.persist(post);

        // check if ordering by main object works correctly

        const loadedPosts1 = await connection.entityManager
            .createQueryBuilder(Post, "post")
            .leftJoinAndSelect("post.categories", "categories")
            .getMany();

        expect(loadedPosts1).not.to.be.empty;
        loadedPosts1.should.be.eql([{
            id: 1,
            title: "Hello Post",
            categories: []
        }]);

    })));

    it("should return empty array if its joined and nothing was found, but relations in empty results should be skipped", () => Promise.all(connections.map(async function(connection) {

        const post = new Post();
        post.title = "Hello Post";
        await connection.entityManager.persist(post);

        // check if ordering by main object works correctly

        const loadedPosts1 = await connection.entityManager
            .createQueryBuilder(Post, "post")
            .leftJoinAndSelect("post.categories", "categories")
            .leftJoinAndSelect("categories.authors", "authors")
            .getMany();

        expect(loadedPosts1).not.to.be.empty;
        loadedPosts1.should.be.eql([{
            id: 1,
            title: "Hello Post",
            categories: []
        }]);

    })));

});