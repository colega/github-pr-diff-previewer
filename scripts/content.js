const maxDiffLines = 50;

const injectDiff = function() {
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="js-timeline-item js-timeline-progressive-focus-container">
        <div>
          <div>
            <div data-view-component="true" class="TimelineItem">
              <div data-view-component="true" class="TimelineItem-badge">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-file-diff d-none d-md-inline-block">
                    <path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073ZM8 3.25a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0V7h-1.5a.75.75 0 0 1 0-1.5h1.5V4A.75.75 0 0 1 8 3.25Zm-3 8a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"></path>
                </svg>
              </div>
              <div id="diff-preview" data-view-component="true" class="TimelineItem-body">
                <div class="d-flex flex-items-center flex-justify-center">
                  <svg data-hide-on-error="true" style="box-sizing: content-box; color: var(--color-icon-primary);" width="32" height="32" viewBox="0 0 16 16" fill="none" data-view-component="true" class="anim-rotate">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"></circle>
                  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
                </svg>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Find the first element with class "js-timeline-item" in the current page
    const timelineItem = document.querySelector('.js-timeline-item');

    // Insert the <diff-layout> element after the first .js-timeline-item
    timelineItem.parentNode.insertBefore(template.content, timelineItem.nextSibling);

    fetch(window.location.href + "/files")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(htmlContent => {
            // Create a temporary element to parse the HTML content
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlContent;

            // Find the <diff-layout> element in the parsed HTML
            const diffLayoutElement = tempElement.querySelector('diff-layout');
            // Remove the filter for commits and tree.
            diffLayoutElement.querySelector('div.pr-toolbar div:has(> instrument-files)').remove();
            // Remove the sidebar, if present.
            const sideBar = diffLayoutElement.querySelector('div[side="left"]');
            if (sideBar) {
                sideBar.classList.add("hx_Layout--sidebar-hidden");
            }

            // Replace the spinner with the diff.
            document.getElementById('diff-preview').replaceChildren(diffLayoutElement);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function onDiffstatClick() {
    injectDiff();
    removeDiffstatListener();
};

function removeDiffstatListener() {
    const diffstatElement = document.getElementById('diffstat');
    if (diffstatElement) {
        diffstatElement.removeEventListener('click', onDiffstatClick);
        diffstatElement.style.cursor = '';
    }
}

function onPullRequestLoad() {
    console.log("Loading diff previewer on main PR page.")
    const added = parseInt(document.querySelector('#diffstat .color-fg-success').innerHTML.trim().replace(',', ''));
    const removed = parseInt(document.querySelector('#diffstat .color-fg-danger').innerHTML.trim().replace('−', '').replace(',', ''));

    if (added + removed < maxDiffLines) {
        injectDiff();
    } else {
        const diffstatElement = document.getElementById('diffstat');
        if (diffstatElement) {
            diffstatElement.style.cursor = 'pointer';
            diffstatElement.addEventListener('click', onDiffstatClick);
        }
    }
}

const prURLRegex = /https:\/\/github.com\/[^//]+\/[^//]+\/pull\/\d+/;
if (prURLRegex.test(window.location.href)) {
    onPullRequestLoad();
}