SHELL:=/bin/bash

stage ?= sandbox
account ?= sandbox



.PHONY: check
check: lint test

.PHONY: clean
clean:
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete
	rm -rf .coverage
	rm -rf coverage
	rm -rf htmlcov
	rm -rf .pytest_cache
	rm -rf .cache
	rm -rf .serverless
	rm -rf dist

.PHONY: lint
lint:
	yarn lint

.PHONY: type
type: clean
	yarn tsc --noemit
.PHONY: build
build: clean
	yarn build
.PHONY: test
test:
	yarn coverage --maxWorkers=2
.PHONY: check
check: lint type test
