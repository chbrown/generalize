BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts) .gitignore .npmignore

$(BIN)/tsc $(BIN)/_mocha $(BIN)/istanbul:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d

.gitignore: tsconfig.json
	echo $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts) coverage/ | tr ' ' '\n' > $@

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) .travis.yml Makefile tsconfig.json coverage/ | tr ' ' '\n' > $@

test: $(JAVASCRIPT) $(BIN)/istanbul $(BIN)/_mocha $(BIN)/coveralls
	$(BIN)/istanbul cover $(BIN)/_mocha -- --compilers js:babel-core/register tests/ -R spec
	cat coverage/lcov.info | $(BIN)/coveralls || true
