# HAgAl [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl?ref=badge_shield)

```
  .............................................
  |   @  SHOW  MOVE  ADD  EDIT  DELETE  NEXT  |
  '''''''''''''''''''''''''''''''''''''''''''''
       ==[]====== MOLECULAR DESIGN ============
       |                 H                   /\
       |        AG    H                      ||
       |          .--''. .--..  AG           ||
       |          '.    '     ''             ||
       |  H. .H     |   |                    []
       |  '   '.    '. |      AL             ||
       |       '----'   '-----.        AL    ||
       |             H       '----''''       ||
       |      AL            H                ||
       |                                     ||
       | T R A N S P A R E N T               ||
       |   A L U M I N I U M                 ||
       |                                     \/
       <[]==================================>[]

```

A fairly simple framework which combines event sourcing with a plugin
architecture to produce simple, robust multi-user applications.

```
              : application :              :      plugins
              :             :              :
   .- state --:--> view ----:--> prompt ---:--> interaction
  |     ^     :             :      |       :         |
  |     |     :             :      v       :         |
  |     |'----:-- default   :   command <--:--------'
  |     |     :             :      |       :
  |     |     :             :      v       :
   '----^-----:--> apply <--:--- event     :
        |     :      |      :      |       :
        |     :       '-----:-------'------:--------.
        |     :             :              :         v
         '----:-------------:--------------:--- persistence
              :             :              :
```

- *state* is a JSON-serializable value describing the full current state of the
  *application*.
- The initial *state* comes from the *persistence* *plugin*, falling back the
  *application*'s *default* if none is available from the *persistence*
  *plugin*.
- *view* is a function describing, given the *state* and a user ID, a *prompt*.
- A *prompt* is a description of a simple form.  It can be queried for by an
  *interaction* *plugin* to show to the user.
- A *command* is generated by an *interaction* *plugin*.  It is compared to the
  *prompt* to ensure that it is valid.
- Executing the *command* produces an *event*, which is a JSON-serializable
  value describing a change to make to the *state*.
- *apply* is a function describing, given a *state* and an *event*, the
  resulting *state*.
- The *event* and *state* are given to the *persistence* plugin.
- When the *event*/*state* has been persisted, *interaction* plugins are
  notified to refresh all shown *prompt*s.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl?ref=badge_large)
