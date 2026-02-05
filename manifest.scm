
(specifications->manifest
 (list "tup" ;; see Tupfile, is build system"node" ;;npx to run typescript compiler
       "pandoc" ;; used to convert markdown to html for main page
       "bash" ;; some part of npx complains if it doesn't have the sh command
       ))


;; guix shell --manifest=manifest.scm --expose=/run/privilaged/bin/fusermount3 --pure
;;  PATH=$PATH:/run/privilaged/bin tup && exit
