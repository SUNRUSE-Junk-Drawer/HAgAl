# HAgAl [![Travis](https://img.shields.io/travis/jameswilddev/HAgAl.svg)](https://travis-ci.org/jameswilddev/HAgAl) [![License](https://img.shields.io/github/license/jameswilddev/HAgAl.svg)](https://github.com/jameswilddev/HAgAl/blob/master/license) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl?ref=badge_shield)[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

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

- A *plugin* notifies HAgAl of an *event*, likely caused by user input.
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

## Usage

The NPM package "hagal" is a collection of modules which can be taken and used
individually, to assemble plugins or applications.  In this way, the internal
file structure of the package is considered its API; changes to the file
structure will be considered breaking and require a new major version.

Additionally, many of the plugins included, while themselves small, require
external dependencies to use.  These have been listed as NPM peer dependencies.

### hagal/*.d.ts

Any *.d.ts files without accompanying *.js files are Typescript type definitions
without any associated runtime code.

### hagal/ConsoleLogger

A logging plugin which writes log messages to the JavaScript console.

### hagal/FilePluginFactory

This is a simple persistence plugin which reads/writes the latest state as a
file, overwriting it every time it changes.

#### Additional Dependencies

- mkdirp

### hagal/HttpPluginFactory

Exposes your application over HTTP, allowing users to connect with their web
browser and view/respond to prompts.

This is designed in such a way that it should work on any browser, even those
without JavaScript; see
[HttpPluginFactory.md](Applications/Plugins/InteractionHttpPluginFactory.md) for
details on its implementation.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjameswilddev%2FHAgAl?ref=badge_large)
