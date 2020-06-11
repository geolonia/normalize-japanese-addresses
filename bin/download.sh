#!/usr/bin/env bash

SCRIPT_DIR=$(cd $(dirname $0); pwd)
CACHE_DIR=${SCRIPT_DIR}/../cache
OUTPUT=${CACHE_DIR}/isj.txt.gz

SAC_LABEL=${CACHE_DIR}/sac_label.json
SAC_PARENT=${CACHE_DIR}/sac_parent.json
SAC_CHANGE=${CACHE_DIR}/sac_change.json

mkdir -p ${CACHE_DIR}
rm -f ${OUTPUT}

for no in `seq -w 1000 1000 47000` ; do
  url="https://nlftp.mlit.go.jp/isj/dls/data/11.0b/${no}-11.0b.zip"
  zip=${CACHE_DIR}/${no}.zip
  if [ ! -e "${zip}" ] ; then
    curl --insecure $url > ${zip}
  fi
  unzip -p ${zip} '*.[cC][sS][vV]' | iconv -f CP932 -t utf8 | \
  sed 's/"白糠町"/"白糠郡白糠町"/' | \
  sed 's/"07023","郡山市"/"07203","郡山市"/' | \
  sed 's/"40305","筑紫郡那珂川町"/"40305","那珂川市"/' | \
  sed 's/"431050098005","弓削六丁目"/"431050098006","弓削六丁目"/' | \
  sed '/"041030090000"/s/,"3"/,"1"/' | \
  sed '/"072070142000"/s/,"3"/,"1"/' | \
  sed '/"072070143000"/s/,"3"/,"1"/' | \
  sed '/"072070144000"/s/,"3"/,"1"/' | \
  sed '/"072030237001"/s/,"1"/,"3"/' | \
  sed '/"072030237002"/s/,"1"/,"3"/' | \
  sed '/"072030237003"/s/,"1"/,"3"/' | \
  sed '/"072030238001"/s/,"1"/,"3"/' | \
  sed '/"072030238002"/s/,"1"/,"3"/' | \
  sed '/"112310025001"/s/,"1"/,"3"/' | \
  sed '/"112310025002"/s/,"1"/,"3"/' | \
  sed '/"112310025003"/s/,"1"/,"3"/' | \
  sed '/"232200381001"/s/,"1"/,"3"/' | \
  grep -v '"222130002000","紅葉台"' | \
  gzip >> ${OUTPUT}

done

if [ ! -e "${SAC_LABEL}" ] ; then

curl --insecure -v -H 'Accept: application/sparql-results+json' --data-urlencode 'query@-' http://data.e-stat.go.jp/lod/sparql/alldata/query > ${SAC_LABEL} << EOS
PREFIX sacs: <http://data.e-stat.go.jp/lod/terms/sacs#>
PREFIX ic: <http://imi.go.jp/ns/core/rdf#>

select ?id ?label ?valid where {?id a sacs:StandardAreaCode ; ic:表記 ?label. optional {?id dcterms:valid ?valid.}}

EOS

fi

if [ ! -e "${SAC_PARENT}" ] ; then

curl --insecure -v -H 'Accept: application/sparql-results+json' --data-urlencode 'query@-' http://data.e-stat.go.jp/lod/sparql/alldata/query > ${SAC_PARENT} << EOS
PREFIX sacs: <http://data.e-stat.go.jp/lod/terms/sacs#>
PREFIX dcterms: <http://purl.org/dc/terms/>

select ?id ?parent where {?id a sacs:StandardAreaCode ; dcterms:isPartOf ?parent.}

EOS

fi

if [ ! -e "${SAC_CHANGE}" ] ; then

curl --insecure -v -H 'Accept: application/sparql-results+json' --data-urlencode 'query@-' http://data.e-stat.go.jp/lod/sparql/alldata/query > ${SAC_CHANGE} << EOS
PREFIX sacs: <http://data.e-stat.go.jp/lod/terms/sacs#>

select ?id ?next where {
  {?id a sacs:StandardAreaCode; sacs:succeedingCode ?next.}
  union
  {?id a sacs:StandardAreaCode; sacs:succeedingMunicipality ?next.}
}
EOS

fi
