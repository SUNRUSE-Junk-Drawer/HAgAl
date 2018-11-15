# HttpPluginFactory

HttpPluginFactory exposes a method (httpHandler) which can be used as a handler
in most Node HTTP or HTTPS pipelines.

It does not require WebSockets, or even JavaScript to use; a combination of the
HTTP "Refresh" header and long polling is used to refresh the prompt (which is a
HTML form) when invalidated by other users' actions.

The session ID is stored in a cookie.

This in itself implements a number of routes:

## `GET`

A minimal page with an iframe pointing toward `GET /?latest-prompt`.

This exists for two reasons:

- The refresh button will always go back (indirectly) to `GET ?latest-prompt`;
  if not wrapped in an iframe, an error during the long poll would instead cause
  the refresh to go to `GET /?poll-hash={hash}`, which will then not load until
  another user acts.
- Custom CSS can be applied here, reducing the "flash" when the prompt is
  refreshed by keeping a persistent background.

### Sample response body

```html
<html>
  <head>
    <!-- Custom head HTML -->
  </head>
  <body>
    <iframe frameBorder=0 width=100% height=100%
    style="position: absolute; left: 0; right: 0; top: 0; bottom: 0"
    src=your-route?latest-prompt>
    </iframe>
  </body>
</html>
```

## `GET ?latest-prompt`

Gets the latest prompt; this is a HTML form based upon it.  The "Refresh" HTTP
header will be set to `GET ?poll-hash={hash}`.

### Sample response bodies

#### (no control)

```html
<html>
  <body>
    <h1>Application Title</h1>
    <h2>Prompt Title</h2>
    <p>Prompt Description</p>

    <!-- May be absent. -->
    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=back value=Back />
    </form>

    <form method=post action=your/route?logout>
      <input id=logout type=submit value="Log Out" />
    </form>
  </body>
</html>
```

#### Multiple choice

```html
<html>
  <body>
    <h1>Application Title</h1>
    <h2>Prompt Title</h2>
    <p>Prompt Description</p>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=choice value="Choice Label A" />
    </form>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=choice value="Choice Label B" />
    </form>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=choice value="Choice Label C" />
    </form>

    <!-- May be absent. -->
    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=back value=Back />
    </form>

    <form method=post action=your/route?logout>
      <input id=logout type=submit value="Log Out" />
    </form>
  </body>
</html>
```

#### Text

```html
<html>
  <body>
    <label for=control>
      <h1>Application Title</h1>
      <h2>Prompt Title</h2>
      <p>Prompt Description</p>
    </label>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input id=control type=text name=text minlength=3 maxlength=5 required
      autofocus />
      <input type=submit value=Submit />
    </form>

    <!-- May be absent. -->
    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=back value=Back />
    </form>

    <form method=post action=your/route?logout>
      <input id=logout type=submit value="Log Out" />
    </form>
  </body>
</html>
```

#### Password

```html
<html>
  <body>
    <label for=control>
      <h1>Application Title</h1>
      <h2>Prompt Title</h2>
      <p>Prompt Description</p>
    </label>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input id=control type=password name=password minlength=3 maxlength=5
      required autofocus />
      <input type=submit value=Submit />
    </form>

    <!-- May be absent. -->
    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=back value=Back />
    </form>

    <form method=post action=your/route?logout>
      <input id=logout type=submit value="Log Out" />
    </form>
  </body>
</html>
```

#### Number

```html
<html>
  <body>
    <label for=control>
      <h1>Application Title</h1>
      <h2>Prompt Title</h2>
      <p>Prompt Description</p>
    </label>

    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input id=control type=number name=number min=3 max=5 step=0.25
      required autofocus />
      <input type=submit value=Submit />
    </form>

    <!-- May be absent. -->
    <form method=post>
      <input type=hidden name=hash value={hash} />
      <input type=submit name=back value=Back />
    </form>

    <form method=post action=your/route?logout>
      <input id=logout type=submit value="Log Out" />
    </form>
  </body>
</html>
```

## `GET ?poll-hash={hash}`

Performs the long poll, not responding until another user acts, after which it
returns the same response as `GET ?latest-prompt`.

## `POST ?latest-prompt`/`POST ?poll-hash={hash}`

Processes a command, before redirecting (302) to `GET ?latest-prompt` regardless
of whether it was accepted (the prompt hash could mismatch, or the command given
could make no sense).

### Sample request bodies

#### Multiple choice

```
hash={hash}&choice={label}
```

#### Text

```
hash={hash}&text={text}
```

#### Password

```
hash={hash}&password={password}
```

#### Number

```
hash={hash}&number={number}
```

#### Back

```
hash={hash}&back=Back
```

### `POST ?logout`

Erases the session ID cookie before redirecting (302) to `GET ?latest-prompt`.
