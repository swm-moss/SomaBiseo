package com.somabiseo.domain.source.domain;

import java.util.List;

public interface SomaSourceClient {
    List<NoticeSourceItem> fetchNotices();

    List<SomaEventSourceItem> fetchEvents();
}
