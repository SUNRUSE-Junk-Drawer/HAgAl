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

## Architecture

### General

#### Start

```
 application :    data     :    plugins
             :             :
   initial --:-------------:--> pluginA
             :             :       |
             :             :       v
             :             :    pluginB
             :             :       |
             :             :       v
             :    state <--:--- pluginC
             :             :
```

- The *application* provides a default *initial* *state*.
- This is passed through the chain of *plugins*, each of which can replace that
  *state*, such as restoring it from persistence.

#### Event

```
 application :    data     :    plugins
             :             :
    apply ---:--> state -.-:--> pluginA
      ^      :       .---' :       |
      |      :      |      :       v
       '-----:--- event <--:--- pluginB
             :             :       |
             :             :       v
             :             :    pluginC
             :             :
```

- A *plugin* notifies HAgAl of an *event*, likely caused by .
- The *application* applies the *event* to the latest *state* to produce a new
  *state*.
- The *event* and new *state* are passed through to each *plugin* in turn.  From
  here, they can notify external systems or persist that *event* and/or *state*.

### Prompts

HAgAl is intended to be used as part of an application which produces *prompts*,
which are are single-*control* forms.

#### Query

```
 application :     data      :    plugins
             :               :
             :   sessionId <-:--- pluginA
             :       |       :       ^
             :  .---'        :       |
     view <--:-'-- state     :       |
      |      :               :       |
       '-----:---> prompt ---:------'
             :               :
```

- The *plugin* provides a *sessionId*.
- The *application*'s *view* combines this with the current *state* to produce a
  *prompt*.
- This is returned to the *plugin* which can then relay it to an external
  system.

#### Command

```
 application :     data      :    plugins
             :               :
             :   sessionId <-:--- pluginA
             :       |       :       |
             :  .---'        :       |
  .- view <--:-'-- state     :       |
 |           :               :       |
 |           :    command <--:------'
 |           :       |       :
 |           :       v       :
  '----------:-->  prompt    :
             :       |       :
             :       v       :
             :     event     :
             :               :
```

- The *plugin* provides a *sessionId* and *command*.
- The *application*'s *view* combines the *sessionId* with the current *state*
  to produce the *prompt* which should be visible to the external system.
- The *prompt* and *command* are compared to ensure that they match.
- An *event* is generated from the combination of the *prompt* and *command*.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl?ref=badge_large)
